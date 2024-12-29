import { 
  CheckCircleIcon,
  TruckIcon,
  ClockIcon,
  ShoppingBagIcon,
  XCircleIcon,
  GiftIcon,
} from '@heroicons/react/solid';

const timelineSteps = [
  {
    id: 'pending',
    name: 'Order Placed',
    description: 'Your order has been placed successfully',
    icon: ShoppingBagIcon,
    status: 'pending'
  },
  {
    id: 'processing',
    name: 'Processing',
    description: 'Your order is being processed',
    icon: ClockIcon,
    status: 'processing'
  },
  {
    id: 'packed',
    name: 'Packed',
    description: 'Your order has been packed and is ready for shipping',
    icon: GiftIcon,
    status: 'packed'
  },
  {
    id: 'shipped',
    name: 'Shipped',
    description: 'Your order has been shipped',
    icon: TruckIcon,
    status: 'shipped'
  },
  {
    id: 'delivered',
    name: 'Delivered',
    description: 'Your order has been delivered',
    icon: CheckCircleIcon,
    status: 'delivered'
  }
];

export default function OrderTimeline({ currentStatus, statusTimestamps = {} }) {
  const getStepStatus = (stepStatus) => {
    const statusOrder = ['pending', 'processing', 'packed', 'shipped', 'delivered', 'cancelled'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepStatus);

    if (currentStatus === 'cancelled') {
      return 'cancelled';
    }

    // For pending status, show it as complete if we're past it
    if (stepStatus === 'pending' && currentIndex > stepIndex) {
      return 'complete';
    }

    // If we have a timestamp for this step, it's complete
    if (statusTimestamps[stepStatus]) {
      return 'complete';
    }

    // If it's the current status, mark as current
    if (stepStatus === currentStatus) {
      return 'current';
    }

    // If it's before the current status in the order, it should be complete
    if (stepIndex < currentIndex) {
      return 'complete';
    }

    // Otherwise it's upcoming
    return 'upcoming';
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }).format(date);
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return '';
    }
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {timelineSteps.map((step, stepIdx) => {
          const status = getStepStatus(step.status);
          const isLast = stepIdx === timelineSteps.length - 1;
          const timestamp = statusTimestamps[step.status];
          
          return (
            <li key={step.id}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span
                      className={`
                        h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white
                        ${status === 'complete' ? 'bg-green-500' : ''}
                        ${status === 'current' ? 'bg-blue-500' : ''}
                        ${status === 'upcoming' ? 'bg-gray-200' : ''}
                        ${status === 'cancelled' ? 'bg-red-500' : ''}
                      `}
                    >
                      {status === 'cancelled' ? (
                        <XCircleIcon className="h-5 w-5 text-white" aria-hidden="true" />
                      ) : (
                        <step.icon
                          className={`h-5 w-5 ${
                            status === 'upcoming' ? 'text-gray-500' : 'text-white'
                          }`}
                          aria-hidden="true"
                        />
                      )}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 pt-1.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className={`text-sm font-medium ${
                          status === 'complete' ? 'text-green-600' :
                          status === 'current' ? 'text-blue-600' :
                          status === 'cancelled' ? 'text-red-600' :
                          'text-gray-500'
                        }`}>
                          {step.name}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">{step.description}</p>
                      </div>
                      <div className="flex flex-col items-end ml-2">
                        {status === 'complete' && (
                          <p className="text-sm text-green-500">Completed</p>
                        )}
                        {status === 'current' && (
                          <p className="text-sm text-blue-500">In Progress</p>
                        )}
                        {status === 'cancelled' && (
                          <p className="text-sm text-red-500">Cancelled</p>
                        )}
                        {timestamp && (
                          <p className="text-xs text-gray-500 mt-1 whitespace-nowrap">
                            {formatTimestamp(timestamp)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
} 