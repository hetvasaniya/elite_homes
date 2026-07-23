/**
 * PropertyStatusBadge — reusable status pill
 * props: status ('pending' | 'approved' | 'rejected' | 'archived')
 */
export default function PropertyStatusBadge({ status }) {
  const config = {
    pending: {
      label: 'Pending Review',
      className: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
      dot: 'bg-amber-400 animate-pulse',
    },
    approved: {
      label: 'Approved',
      className: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
      dot: 'bg-emerald-400',
    },
    rejected: {
      label: 'Rejected',
      className: 'bg-red-500/15 text-red-400 border border-red-500/30',
      dot: 'bg-red-400',
    },
    archived: {
      label: 'Archived',
      className: 'bg-slate-500/15 text-slate-400 border border-slate-500/30',
      dot: 'bg-slate-400',
    },
    // Legacy support
    Active: {
      label: 'Active',
      className: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
      dot: 'bg-emerald-400',
    },
    Archived: {
      label: 'Archived',
      className: 'bg-slate-500/15 text-slate-400 border border-slate-500/30',
      dot: 'bg-slate-400',
    },
  }

  const cfg = config[status] || config.pending

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}
