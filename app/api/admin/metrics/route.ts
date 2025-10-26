import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Verify admin role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || !['admin', 'super_admin'].includes(userData.role)) {
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get order stats
    const { data: orderStats } = await supabaseAdmin
      .from('orders')
      .select('status');

    const statusCounts = orderStats?.reduce((acc: any, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    // Get payment stats
    const { data: paymentStats } = await supabaseAdmin
      .from('payments')
      .select('status, amount');

    const paymentCounts = paymentStats?.reduce((acc: any, payment) => {
      acc[payment.status] = (acc[payment.status] || 0) + 1;
      return acc;
    }, {});

    const totalRevenue = paymentStats
      ?.filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0) || 0;

    // Get user counts
    const { data: userCounts } = await supabaseAdmin
      .from('users')
      .select('role');

    const roleCounts = userCounts?.reduce((acc: any, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    // Get recent feedback
    const { data: recentFeedback } = await supabaseAdmin
      .from('feedback')
      .select('rating')
      .order('created_at', { ascending: false })
      .limit(100);

    const averageRating = recentFeedback?.length
      ? recentFeedback.reduce((sum, f) => sum + f.rating, 0) / recentFeedback.length
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        orders: {
          total: orderStats?.length || 0,
          byStatus: statusCounts,
        },
        payments: {
          total: paymentStats?.length || 0,
          byStatus: paymentCounts,
          totalRevenue,
        },
        users: {
          total: userCounts?.length || 0,
          byRole: roleCounts,
        },
        feedback: {
          averageRating: averageRating.toFixed(2),
          totalReviews: recentFeedback?.length || 0,
        },
      },
    });
  } catch (error) {
    console.error('Get metrics error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
