import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { format } from 'date-fns';
import { 
  ShoppingCartIcon,
  CurrencyDollarIcon, 
  ClockIcon,
  ChartBarIcon,
  TrendingUpIcon,
  UserGroupIcon, 
  ExclamationIcon 
} from '@heroicons/react/outline';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    todayOrders: 0,
    todayRevenue: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
    averageOrderValue: 0,
    fulfillmentRate: 0,
    cancelRate: 0,
    recentCustomers: [],
    popularProducts: [],
    orderTrends: {
      daily: [],
      weekly: []
    },
    revenueGrowth: 0,
    orderGrowth: 0,
    topCustomers: [],
    deliveryPerformance: {
      onTime: 0,
      delayed: 0,
      rate: 0
    },
    paymentMethods: {}
  });

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const prevMonth = new Date(monthAgo);
    prevMonth.setMonth(prevMonth.getMonth() - 1);

    const q = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));

      // Calculate metrics
      const completedOrders = orders.filter(o => o.status === 'delivered').length;
      const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
      const totalOrderValue = orders.reduce((sum, order) => 
        sum + (order.total || order.orderTotal || order.items?.reduce((s, item) => 
          s + (item.price || item.productPrice) * item.quantity, 0) || 0), 0);

      // Calculate popular products
      const productCounts = {};
      orders.forEach(order => {
        order.items?.forEach(item => {
          const productName = item.name || item.productName;
          productCounts[productName] = (productCounts[productName] || 0) + item.quantity;
        });
      });

      const popularProducts = Object.entries(productCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      // Get recent unique customers
      const recentCustomers = [...new Set(orders
        .filter(o => o.customerInfo?.email)
        .map(o => ({
          email: o.customerInfo.email,
          name: o.customerInfo.name,
          orderCount: orders.filter(ord => ord.customerInfo?.email === o.customerInfo.email).length
        })))].slice(0, 5);

      // Calculate revenue growth
      const currentMonthRevenue = orders
        .filter(o => o.createdAt >= monthAgo)
        .reduce((sum, order) => sum + (order.total || 0), 0);
      
      const previousMonthRevenue = orders
        .filter(o => o.createdAt >= prevMonth && o.createdAt < monthAgo)
        .reduce((sum, order) => sum + (order.total || 0), 0);

      const revenueGrowth = previousMonthRevenue === 0 ? 100 :
        ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;

      // Calculate daily order trends
      const dailyOrders = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const count = orders.filter(o => 
          o.createdAt && o.createdAt.getDate() === date.getDate() &&
          o.createdAt.getMonth() === date.getMonth()
        ).length;
        return { date: format(date, 'EEE'), count };
      }).reverse();

      // Calculate payment methods distribution
      const paymentMethods = orders.reduce((acc, order) => {
        const method = order.paymentMethod || 'Other';
        acc[method] = (acc[method] || 0) + 1;
        return acc;
      }, {});

      // Calculate delivery performance
      const deliveredOrders = orders.filter(o => o.status === 'delivered');
      const onTimeDeliveries = deliveredOrders.filter(o => {
        const deliveryTime = o.deliveredAt - o.createdAt;
        return deliveryTime <= 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
      }).length;

      setMetrics({
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        processingOrders: orders.filter(o => o.status === 'processing').length,
        todayOrders: orders.filter(o => o.createdAt >= today).length,
        todayRevenue: orders
          .filter(o => o.createdAt >= today)
          .reduce((sum, order) => sum + (order.total || order.orderTotal || order.items?.reduce((s, item) => s + (item.price || item.productPrice) * item.quantity, 0) || 0), 0),
        weeklyRevenue: orders
          .filter(o => o.createdAt >= weekAgo)
          .reduce((sum, order) => sum + (order.total || order.orderTotal || order.items?.reduce((s, item) => s + (item.price || item.productPrice) * item.quantity, 0) || 0), 0),
        monthlyRevenue: orders
          .filter(o => o.createdAt >= monthAgo)
          .reduce((sum, order) => sum + (order.total || order.orderTotal || order.items?.reduce((s, item) => s + (item.price || item.productPrice) * item.quantity, 0) || 0), 0),
        averageOrderValue: orders.length ? (totalOrderValue / orders.length) : 0,
        fulfillmentRate: orders.length ? (completedOrders / orders.length * 100) : 0,
        cancelRate: orders.length ? (cancelledOrders / orders.length * 100) : 0,
        popularProducts,
        recentCustomers,
        orderTrends: {
          daily: dailyOrders
        },
        revenueGrowth,
        deliveryPerformance: {
          onTime: onTimeDeliveries,
          delayed: deliveredOrders.length - onTimeDeliveries,
          rate: deliveredOrders.length ? (onTimeDeliveries / deliveredOrders.length) * 100 : 0
        },
        paymentMethods
      });
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Dashboard</h1>

        {/* Key Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Today's Orders */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
          <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShoppingCartIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Today's Orders</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{metrics.todayOrders}</div>
                    </dd>
                  </dl>
                </div>
            </div>
          </div>
        </div>

          {/* Today's Revenue */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
          <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Today's Revenue</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">${metrics.todayRevenue.toFixed(2)}</div>
                    </dd>
                  </dl>
                </div>
            </div>
          </div>
        </div>

          {/* Pending Orders */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
          <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Orders</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{metrics.pendingOrders}</div>
                      {metrics.pendingOrders > 0 && (
                        <div className="ml-2 flex items-baseline text-sm font-semibold text-yellow-600">
                          Needs attention
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Monthly Revenue</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">${metrics.monthlyRevenue.toFixed(2)}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Order Trends */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Order Trends</h3>
              <div className="space-y-4">
                {metrics.orderTrends.daily.map((day, index) => (
                  <div key={index} className="flex items-center">
                    <span className="w-12 text-sm text-gray-500">{day.date}</span>
                    <div className="flex-1 ml-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(day.count / Math.max(...metrics.orderTrends.daily.map(d => d.count))) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="ml-4 text-sm font-medium text-gray-900">{day.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Popular Products */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Products</h3>
              <div className="space-y-3">
                {metrics.popularProducts.map((product, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{product.name}</span>
                    <span className="text-sm font-medium text-gray-900">{product.count} sold</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Customers */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Customers</h3>
              <div className="space-y-3">
                {metrics.recentCustomers.map((customer, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{customer.name}</span>
                      <span className="text-xs text-gray-500">{customer.email}</span>
                    </div>
                    <span className="text-sm text-gray-500">{customer.orderCount} orders</span>
                  </div>
                ))}
        </div>
      </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Revenue Growth */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Growth</h3>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-gray-900">
                  {metrics.revenueGrowth > 0 ? '+' : ''}{metrics.revenueGrowth.toFixed(1)}%
                </span>
                <span className="text-sm text-gray-500">vs last month</span>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Previous Month</span>
                  <span>Current Month</span>
                </div>
                <div className="mt-2 relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${metrics.revenueGrowth >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(Math.abs(metrics.revenueGrowth), 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
          </div>
        </div>
      </div>

          {/* Delivery Performance */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Performance</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">On-Time Delivery Rate</span>
                    <span className="text-gray-900">{metrics.deliveryPerformance.rate.toFixed(1)}%</span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${metrics.deliveryPerformance.rate}%` }}
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-green-600">
                      {metrics.deliveryPerformance.onTime}
                    </div>
                    <div className="text-sm text-gray-500">On Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-yellow-600">
                      {metrics.deliveryPerformance.delayed}
                    </div>
                    <div className="text-sm text-gray-500">Delayed</div>
                  </div>
                </div>
              </div>
        </div>
      </div>

          {/* Performance Overview */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Overview</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Fulfillment Rate</span>
                    <span className="text-gray-900">{metrics.fulfillmentRate.toFixed(1)}%</span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${metrics.fulfillmentRate}%` }}
                    ></div>
                  </div>
        </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Cancel Rate</span>
                    <span className="text-gray-900">{metrics.cancelRate.toFixed(1)}%</span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${metrics.cancelRate}%` }}
                    ></div>
                  </div>
                </div>
                <div className="pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Average Order Value</span>
                    <span className="text-gray-900">${metrics.averageOrderValue.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 