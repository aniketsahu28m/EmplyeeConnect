// Small, quiet status indicators: a coloured dot next to plain text.

const DOTS = {
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
  gray: 'bg-gray-400',
};

const STATUS_TONES = {
  Completed: 'green',
  Active: 'blue',
  'In Progress': 'yellow',
  Upcoming: 'gray',
  Pending: 'gray',
  Present: 'green',
  Absent: 'red',
  Late: 'yellow',
  'Half Day': 'yellow',
  Leave: 'gray',
  Paid: 'green',
  Unpaid: 'yellow',
};

export const StatusLabel = ({ status, tone }) => (
  <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] text-gray-700">
    <span className={`h-1.5 w-1.5 rounded-full ${DOTS[tone ?? STATUS_TONES[status] ?? 'gray']}`} />
    {status}
  </span>
);

const PRIORITY_STYLES = {
  High: 'text-red-700',
  Medium: 'text-yellow-700',
  Low: 'text-gray-500',
};

export const PriorityLabel = ({ priority }) => (
  <span className={`text-[13px] font-medium ${PRIORITY_STYLES[priority] ?? 'text-gray-600'}`}>
    {priority}
  </span>
);
