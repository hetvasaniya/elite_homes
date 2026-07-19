import { useEffect, useState, useRef } from 'react'
import { Upload, FileText, Trash2, Download, File, User, Calendar } from 'lucide-react'
import api from '../../hooks/useApi'
import toast from 'react-hot-toast'

export default function AdminDocuments() {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const fileRef = useRef()
  const [selectedFile, setSelectedFile] = useState(null)

  const fetch = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/documents')
      setDocs(res.data)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

  const handleUpload = async () => {
    if (!selectedFile) { toast.error('Please select a PDF file.'); return }
    try {
      setUploading(true)
      const fd = new FormData()
      fd.append('document', selectedFile)
      await api.post('/admin/upload-document', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Document uploaded successfully!')
      setSelectedFile(null)
      if (fileRef.current) fileRef.current.value = ''
      fetch()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed.')
    } finally { setUploading(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document?')) return
    try {
      setDeleting(id)
      await api.delete(`/admin/documents/${id}`)
      toast.success('Document deleted.')
      fetch()
    } catch { toast.error('Failed to delete.') } finally { setDeleting(null) }
  }

  const formatSize = (bytes) => {
    if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    if (bytes > 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${bytes} B`
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Document Management</h1>
        <p className="text-slate-400 text-sm mt-0.5">Upload and manage legal documents and compliance files</p>
      </div>

      {/* Upload Zone */}
      <div className="glass-card p-6">
        <h2 className="font-semibold text-white mb-4">Upload Document</h2>
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-white/10 hover:border-gold-500/40 rounded-2xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-all group"
        >
          <div className="w-14 h-14 rounded-2xl bg-navy-800 group-hover:bg-gold-500/10 flex items-center justify-center transition-colors">
            <Upload className="w-7 h-7 text-slate-500 group-hover:text-gold-400 transition-colors" />
          </div>
          <div className="text-center">
            <p className="text-slate-300 font-medium">Click to select a PDF</p>
            <p className="text-slate-500 text-sm mt-1">Max file size: 10MB</p>
          </div>
          {selectedFile && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gold-500/10 border border-gold-500/30 rounded-xl text-gold-400 text-sm">
              <FileText className="w-4 h-4" />
              {selectedFile.name}
              <span className="text-slate-500">({formatSize(selectedFile.size)})</span>
            </div>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={e => setSelectedFile(e.target.files?.[0] || null)}
        />
        <div className="mt-4 flex justify-end">
          <button
            id="admin-upload-doc-btn"
            onClick={handleUpload}
            disabled={uploading || !selectedFile}
            className="btn-primary"
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-navy-950/50 border-t-navy-950 rounded-full animate-spin" />
                Uploading…
              </span>
            ) : (
              <span className="flex items-center gap-2"><Upload className="w-4 h-4" /> Upload</span>
            )}
          </button>
        </div>
      </div>

      {/* Documents List */}
      <div>
        <h2 className="font-semibold text-white mb-4">Uploaded Documents ({docs.length})</h2>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="glass-card h-20 skeleton" />)}
          </div>
        ) : docs.length === 0 ? (
          <div className="text-center py-12 glass-card">
            <File className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No documents uploaded yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {docs.map(doc => (
              <div key={doc._id} id={`admin-doc-${doc._id}`} className="glass-card p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">{doc.originalName}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{doc.uploadedBy?.name}</span>
                    <span>{formatSize(doc.fileSize)}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(doc.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={doc.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg border border-white/10 text-slate-400 hover:text-blue-400 hover:border-blue-500/30 transition-all"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    id={`delete-doc-${doc._id}`}
                    onClick={() => handleDelete(doc._id)}
                    disabled={deleting === doc._id}
                    className="p-2 rounded-lg border border-white/10 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
