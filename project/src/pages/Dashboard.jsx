import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderPlus,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  CheckCircle,
  Shield,
  Layers,
  Sparkles,
  ArrowRight,
  HardDrive,
  Plus,
  X,
  Lock,
  Loader2,
  Pencil,
  Trash2,
  AlertTriangle,
  Folder,
  FolderOpen,
  MapPin,
  ArrowUpDown,
  Filter,
  Calendar,
  Eye,
  Download,
  Check,
  AlertCircle,
  CheckSquare,
  Square
} from 'lucide-react'
import { getCurrentUser, getAuthToken, logout } from '../api/auth'
import { getProjects, createProject, updateProject, deleteProject } from '../api/projects'
import {
  uploadImage,
  getProjectImages,
  updateImageDisplayName,
  deleteImage,
  batchUpdateImages,
  batchDeleteImages,
  getMediaUrl,
  reverseGeocode
} from '../api/media'
import Lightbox from '../components/Lightbox'
import IndexingStatusBar from '../components/IndexingStatusBar'

function formatDisplayDate(dateStr) {
  if (!dateStr) return ''
  try {
    const raw = String(dateStr).trim()
    let iso = raw
    if (raw.includes(':') && !raw.includes('-')) {
      const parts = raw.split(' ')
      const datePart = parts[0].split(':').join('-')
      iso = datePart + (parts[1] ? 'T' + parts[1] : '')
    } else {
      iso = raw.replace(' ', 'T')
    }
    const d = new Date(iso)
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString()
    }
    const fallback = new Date(raw)
    if (!isNaN(fallback.getTime())) {
      return fallback.toLocaleDateString()
    }
    return ''
  } catch {
    return ''
  }
}

function formatLocationText(loc, lat, lon) {
  const isZeroCoord = (lat === 0 && lon === 0) || (lat === 0.0 && lon === 0.0)
  if (isZeroCoord || !loc || loc === '0.0, 0.0' || loc === '0.0' || loc === '0, 0' || loc === '0.0000, 0.0000' || loc === 'Location unavailable') {
    return 'Location unavailable'
  }
  return loc
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [activeScreen, setActiveScreen] = useState('dashboard')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [user, setUser] = useState(null)

  const [projects, setProjects] = useState([])
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [loadingProjects, setLoadingProjects] = useState(true)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [people, setPeople] = useState('')
  const [goals, setGoals] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [modalError, setModalError] = useState('')

  const [showEditModal, setShowEditModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editPeople, setEditPeople] = useState('')
  const [editGoals, setEditGoals] = useState('')
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError] = useState('')

  const [projectToDelete, setProjectToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const [openFolderId, setOpenFolderId] = useState(null)
  const [projectMedia, setProjectMedia] = useState([])
  const [loadingMedia, setLoadingMedia] = useState(false)

  const [categorizeBy, setCategorizeBy] = useState('none')
  const [sortOption, setSortOption] = useState('newest')

  const [pendingFiles, setPendingFiles] = useState([])
  const [showNameModal, setShowNameModal] = useState(false)
  const [batchNameDraft, setBatchNameDraft] = useState('')
  const [uploadQueue, setUploadQueue] = useState([])
  const [showUploadDrawer, setShowUploadDrawer] = useState(false)
  const [isQueueProcessing, setIsQueueProcessing] = useState(false)

  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [editImageTarget, setEditImageTarget] = useState(null)
  const [editImageName, setEditImageName] = useState('')
  const [savingImageName, setSavingImageName] = useState(false)
  const [imageToDelete, setImageToDelete] = useState(null)
  const [deletingImage, setDeletingImage] = useState(false)

  const [selectedImageIds, setSelectedImageIds] = useState([])
  const [showBatchRenameModal, setShowBatchRenameModal] = useState(false)
  const [batchRenameDraft, setBatchRenameDraft] = useState('')
  const [savingBatchRename, setSavingBatchRename] = useState(false)
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false)
  const [deletingBatch, setDeletingBatch] = useState(false)
  const [resolvedLocations, setResolvedLocations] = useState({})

  const fileInputRef = useRef(null)
  const queueRef = useRef([])
  queueRef.current = uploadQueue

  useEffect(() => {
    projectMedia.forEach((item) => {
      const meta = item.metadata || {}
      const hasCoordinates =
        meta.latitude !== null &&
        meta.latitude !== undefined &&
        meta.longitude !== null &&
        meta.longitude !== undefined

      if (hasCoordinates && !meta.location_name && !resolvedLocations[item.id]) {
        reverseGeocode(meta.latitude, meta.longitude).then((res) => {
          if (res.success && res.data?.location_name) {
            setResolvedLocations((prev) => ({
              ...prev,
              [item.id]: res.data.location_name
            }))
          }
        })
      }
    })
  }, [projectMedia])

  useEffect(() => {
    setSelectedImageIds([])
  }, [openFolderId, activeScreen])

  const [mockIndexedCount, setMockIndexedCount] = useState(0)
  const [isSimulatingIndexing, setIsSimulatingIndexing] = useState(false)

  useEffect(() => {
    if (projectMedia.length > 0) {
      setMockIndexedCount((prev) => {
        if (prev === 0) {
          return Math.max(1, Math.min(projectMedia.length - 1, 2))
        }
        return Math.min(prev, projectMedia.length)
      })
    } else {
      setMockIndexedCount(0)
      setIsSimulatingIndexing(false)
    }
  }, [projectMedia])

  useEffect(() => {
    let timer
    if (isSimulatingIndexing && projectMedia.length > 0) {
      timer = setInterval(() => {
        setMockIndexedCount((prev) => {
          if (prev >= projectMedia.length) {
            setIsSimulatingIndexing(false)
            return projectMedia.length
          }
          const next = prev + 1
          if (next >= projectMedia.length) {
            setIsSimulatingIndexing(false)
          }
          return next
        })
      }, 900)
    }
    return () => clearInterval(timer)
  }, [isSimulatingIndexing, projectMedia.length])

  const handleSimulateToggle = () => {
    if (mockIndexedCount >= projectMedia.length) {
      setMockIndexedCount(0)
      setIsSimulatingIndexing(true)
    } else {
      setMockIndexedCount(projectMedia.length)
      setIsSimulatingIndexing(false)
    }
  }

  const handleReindex = () => {
    setMockIndexedCount(0)
    setIsSimulatingIndexing(true)
  }

  useEffect(() => {
    const token = getAuthToken()
    const storedUser = getCurrentUser()

    if (!token) {
      navigate('/login')
      return
    }

    setUser(storedUser || {
      full_name: 'Team Member',
      username: 'member',
      role: 'field_auditor',
      email: 'member@ddrishti.local'
    })

    loadProjects()
  }, [navigate])

  const loadProjects = async () => {
    setLoadingProjects(true)
    const res = await getProjects()
    if (res.success && res.data) {
      setProjects(res.data)
      if (res.data.length > 0) {
        setSelectedProjectId((prev) => prev || res.data[0].id)
      }
    }
    setLoadingProjects(false)
  }

  const loadMediaForFolder = async (folderId) => {
    if (!folderId) return
    setLoadingMedia(true)
    const res = await getProjectImages(folderId)
    if (res.success && res.data) {
      setProjectMedia(res.data)
    } else {
      setProjectMedia([])
    }
    setLoadingMedia(false)
  }

  useEffect(() => {
    if (activeScreen === 'add-files' && openFolderId) {
      loadMediaForFolder(openFolderId)
    }
  }, [activeScreen, openFolderId])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    if (!projectName.trim()) {
      setModalError('Please enter a project name')
      return
    }

    setSubmitting(true)
    setModalError('')

    const payload = {
      project_name: projectName.trim(),
      project_description: projectDescription.trim(),
      people: people.trim(),
      goals: goals.trim()
    }

    const result = await createProject(payload)
    setSubmitting(false)

    if (result.success && result.data) {
      const newProj = result.data
      setProjects([newProj, ...projects])
      setSelectedProjectId(newProj.id)
      setShowCreateModal(false)
      setProjectName('')
      setProjectDescription('')
      setPeople('')
      setGoals('')
    } else {
      setModalError(result.error || 'Failed to create project')
    }
  }

  const handleOpenEdit = (project) => {
    setEditId(project.id)
    setEditName(project.project_name || '')
    setEditDesc(project.project_description || '')
    setEditPeople(project.people || '')
    setEditGoals(project.goals || '')
    setEditError('')
    setShowEditModal(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editName.trim()) {
      setEditError('Please enter a project name')
      return
    }

    setEditSubmitting(true)
    setEditError('')

    const payload = {
      project_name: editName.trim(),
      project_description: editDesc.trim(),
      people: editPeople.trim(),
      goals: editGoals.trim()
    }

    const result = await updateProject(editId, payload)
    setEditSubmitting(false)

    if (result.success && result.data) {
      const updated = result.data
      setProjects(projects.map((p) => (p.id === updated.id ? updated : p)))
      setShowEditModal(false)
    } else {
      if (result.error && result.error.toLowerCase().includes('not found')) {
        await loadProjects()
        setShowEditModal(false)
      } else {
        setEditError(result.error || 'Failed to update project')
      }
    }
  }

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return
    setDeleting(true)

    const result = await deleteProject(projectToDelete.id)
    setDeleting(false)

    if (result.success) {
      const remaining = projects.filter((p) => p.id !== projectToDelete.id)
      setProjects(remaining)
      if (selectedProjectId === projectToDelete.id) {
        setSelectedProjectId(remaining.length > 0 ? remaining[0].id : null)
      }
      if (openFolderId === projectToDelete.id) {
        setOpenFolderId(null)
      }
      setProjectToDelete(null)
    } else {
      if (result.error && result.error.toLowerCase().includes('not found')) {
        await loadProjects()
      } else {
        alert(result.error || 'Failed to remove project')
      }
      setProjectToDelete(null)
    }
  }

  const handleFilesSelected = (files) => {
    const fileList = Array.from(files || [])
    if (fileList.length === 0) return

    const validFiles = []
    const oversizedFiles = []

    for (const f of fileList) {
      if (f.size > 5 * 1024 * 1024) {
        oversizedFiles.push(f.name)
      } else {
        validFiles.push(f)
      }
    }

    if (oversizedFiles.length > 0) {
      alert(`The following file(s) exceed the 5MB size limit and cannot be uploaded:\n• ${oversizedFiles.join('\n• ')}`)
    }

    if (validFiles.length === 0) return

    setPendingFiles(validFiles)
    if (validFiles.length === 1) {
      const baseName = validFiles[0].name.replace(/\.[^/.]+$/, '')
      setBatchNameDraft(baseName)
    } else {
      setBatchNameDraft('Field Site Observation')
    }
    setShowNameModal(true)
  }

  const handleConfirmBatchUpload = () => {
    if (!openFolderId || pendingFiles.length === 0) return

    const finalDisplayName = batchNameDraft.trim() || 'Media Evidence'
    const isGrouped = pendingFiles.length > 1

    const newQueueItems = pendingFiles.map((f, i) => ({
      id: `${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}`,
      file: f,
      displayName: finalDisplayName,
      isGrouped: isGrouped,
      progress: 0,
      status: 'pending',
      error: null
    }))

    setShowNameModal(false)
    setPendingFiles([])
    setBatchNameDraft('')
    setShowUploadDrawer(true)

    setUploadQueue((prev) => [...prev, ...newQueueItems])
  }

  useEffect(() => {
    if (!openFolderId || isQueueProcessing) return

    const pending = uploadQueue.filter((item) => item.status === 'pending')
    const uploading = uploadQueue.filter((item) => item.status === 'uploading')

    if (pending.length === 0 && uploading.length === 0) return

    if (uploading.length < 5 && pending.length > 0) {
      const slotsAvailable = 5 - uploading.length
      const batchToStart = pending.slice(0, slotsAvailable)

      setUploadQueue((current) =>
        current.map((item) =>
          batchToStart.some((b) => b.id === item.id)
            ? { ...item, status: 'uploading' }
            : item
        )
      )

      batchToStart.forEach((item) => {
        uploadImage(
          openFolderId,
          item.file,
          item.displayName,
          item.isGrouped,
          (percent) => {
            setUploadQueue((current) =>
              current.map((q) =>
                q.id === item.id ? { ...q, progress: percent } : q
              )
            )
          }
        ).then((res) => {
          setUploadQueue((current) =>
            current.map((q) => {
              if (q.id === item.id) {
                return res.success
                  ? { ...q, status: 'completed', progress: 100 }
                  : { ...q, status: 'error', error: res.error }
              }
              return q
            })
          )
          if (res.success) {
            loadMediaForFolder(openFolderId)
          }
        })
      })
    }
  }, [uploadQueue, openFolderId, isQueueProcessing])

  const handleUpdateImageName = async (imageId, newName) => {
    if (!openFolderId || !newName.trim()) return
    const res = await updateImageDisplayName(openFolderId, imageId, newName.trim())
    if (res.success && res.data) {
      setProjectMedia((prev) =>
        prev.map((item) => (item.id === imageId ? res.data : item))
      )
    }
  }

  const handleDeleteImage = async (imageId) => {
    if (!openFolderId) return
    const res = await deleteImage(openFolderId, imageId)
    if (res.success) {
      setProjectMedia((prev) => prev.filter((item) => item.id !== imageId))
      if (lightboxIndex !== null) {
        setLightboxIndex(null)
      }
      setImageToDelete(null)
    } else {
      alert(res.error || 'Failed to delete image')
    }
  }

  const handleToggleSelect = (id, e) => {
    if (e) e.stopPropagation()
    setSelectedImageIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedImageIds.length === sortedMedia.length) {
      setSelectedImageIds([])
    } else {
      setSelectedImageIds(sortedMedia.map((m) => m.id))
    }
  }

  const handleClearSelection = () => {
    setSelectedImageIds([])
  }

  const handleOpenBatchRename = () => {
    if (selectedImageIds.length === 0) return
    setBatchRenameDraft('Batch Group Inspection')
    setShowBatchRenameModal(true)
  }

  const handleConfirmBatchRename = async () => {
    if (!openFolderId || selectedImageIds.length === 0 || !batchRenameDraft.trim()) return
    setSavingBatchRename(true)
    const res = await batchUpdateImages(openFolderId, selectedImageIds, batchRenameDraft.trim())
    setSavingBatchRename(false)
    if (res.success && res.data) {
      const updatedMap = new Map(res.data.map((item) => [item.id, item]))
      setProjectMedia((prev) =>
        prev.map((item) => (updatedMap.has(item.id) ? updatedMap.get(item.id) : item))
      )
      setShowBatchRenameModal(false)
      setSelectedImageIds([])
    } else {
      alert(res.error || 'Failed to update names')
    }
  }

  const handleConfirmBatchDelete = async () => {
    if (!openFolderId || selectedImageIds.length === 0) return
    setDeletingBatch(true)
    const res = await batchDeleteImages(openFolderId, selectedImageIds)
    setDeletingBatch(false)
    if (res.success) {
      const deletedSet = new Set(selectedImageIds)
      setProjectMedia((prev) => prev.filter((item) => !deletedSet.has(item.id)))
      if (lightboxIndex !== null) setLightboxIndex(null)
      setShowBatchDeleteModal(false)
      setSelectedImageIds([])
    } else {
      alert(res.error || 'Failed to delete selected images')
    }
  }

  const sortedMedia = useMemo(() => {
    const list = [...projectMedia]
    switch (sortOption) {
      case 'oldest':
        return list.sort((a, b) => new Date(a.upload_time || 0) - new Date(b.upload_time || 0))
      case 'name_asc':
        return list.sort((a, b) => (a.display_name || '').localeCompare(b.display_name || ''))
      case 'name_desc':
        return list.sort((a, b) => (b.display_name || '').localeCompare(a.display_name || ''))
      case 'size_desc':
        return list.sort((a, b) => (b.file_size || 0) - (a.file_size || 0))
      case 'gps_first':
        return list.sort((a, b) => {
          const aGps = a.metadata?.latitude !== null && a.metadata?.latitude !== undefined
          const bGps = b.metadata?.latitude !== null && b.metadata?.latitude !== undefined
          return bGps - aGps
        })
      case 'ai_first':
        return list.sort((a, b) => (b.is_ai_generated ? 1 : 0) - (a.is_ai_generated ? 1 : 0))
      case 'newest':
      default:
        return list.sort((a, b) => new Date(b.upload_time || 0) - new Date(a.upload_time || 0))
    }
  }, [projectMedia, sortOption])

  const categorizedGroups = useMemo(() => {
    if (categorizeBy === 'none') {
      return [{ key: 'all', title: null, items: sortedMedia }]
    }

    if (categorizeBy === 'group') {
      const groupsMap = {}
      const soloItems = []

      for (const item of sortedMedia) {
        if (item.is_grouped) {
          const key = item.display_name || 'Unnamed Batch'
          if (!groupsMap[key]) groupsMap[key] = []
          groupsMap[key].push(item)
        } else {
          soloItems.push(item)
        }
      }

      const result = Object.entries(groupsMap).map(([title, items]) => ({
        key: `group_${title}`,
        title,
        badge: `${items.length} items`,
        items
      }))

      if (soloItems.length > 0) {
        result.push({
          key: 'group_solo',
          title: 'Solo',
          badge: `${soloItems.length} items`,
          items: soloItems
        })
      }

      return result
    }

    if (categorizeBy === 'date') {
      const dateMap = {}
      for (const item of sortedMedia) {
        const dateStr = formatDisplayDate(item.captured_at) || formatDisplayDate(item.upload_time) || 'Undated'

        if (!dateMap[dateStr]) dateMap[dateStr] = []
        dateMap[dateStr].push(item)
      }

      return Object.entries(dateMap).map(([title, items]) => ({
        key: `date_${title}`,
        title,
        badge: `${items.length} photos`,
        items
      }))
    }

    return [{ key: 'all', title: null, items: sortedMedia }]
  }, [sortedMedia, categorizeBy])

  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0]
  const currentOpenFolderProject = projects.find((p) => p.id === openFolderId) || null

  const formatBytes = (bytes) => {
    if (!bytes && bytes !== 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  if (!user) return null

  return (
    <div className={`dashboard-shell ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className="dashboard-sidebar">
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <span className="brand-logo-mark">DD</span>
            {!isCollapsed && (
              <div className="brand-text">
                <span className="brand-name">DDrishti</span>
                <span className="brand-tag">Workspace</span>
              </div>
            )}
          </div>
          <button
            type="button"
            className="collapse-toggle-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <button
            type="button"
            onClick={() => setActiveScreen('dashboard')}
            className={`nav-item ${activeScreen === 'dashboard' ? 'is-active' : ''}`}
            title="Dashboard"
          >
            <LayoutDashboard size={20} className="nav-icon" />
            {!isCollapsed && <span className="nav-label">Dashboard</span>}
          </button>

          <button
            type="button"
            onClick={() => setActiveScreen('add-files')}
            className={`nav-item ${activeScreen === 'add-files' ? 'is-active' : ''}`}
            title="Add files"
          >
            <FolderPlus size={20} className="nav-icon" />
            {!isCollapsed && <span className="nav-label">Add files</span>}
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="user-profile-badge">
            <div className="user-avatar">
              {user.full_name ? user.full_name.charAt(0) : 'U'}
            </div>
            {!isCollapsed && (
              <div className="user-details">
                <span className="user-name">{user.full_name}</span>
                <span className="user-role-label">{user.role ? user.role.replace('_', ' ') : 'Member'}</span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="nav-item logout-btn"
            title="Log out"
          >
            <LogOut size={20} className="nav-icon" />
            {!isCollapsed && <span className="nav-label">Log out</span>}
          </button>
        </div>
      </aside>

      <main className="dashboard-content">
        <header className="content-topbar">
          <div className="topbar-left">
            <span className="breadcrumb-path">
              Workspace / {activeScreen === 'dashboard' ? 'Projects & Overview' : 'Drive Storage'}
            </span>
            <h1 className="screen-heading">
              {activeScreen === 'dashboard' ? 'Dashboard' : 'Add files'}
            </h1>
          </div>

          <div className="topbar-right">
            <div className="system-status-indicator">
              <span className="status-ping" />
              <HardDrive size={15} />
              <span>Drive Storage Active</span>
            </div>
            <div className="user-role-pill">
              <Shield size={14} />
              <span>{user.role ? user.role.replace('_', ' ') : 'Member'}</span>
            </div>
          </div>
        </header>

        <div className="screen-container">
          {activeScreen === 'dashboard' && (
            <div className="dashboard-screen">
              <div className="screen-welcome-card">
                <div className="welcome-text">
                  <h2>Welcome back, {user.full_name}</h2>
                  <p>
                    Manage your field projects, organize photos, and keep track of your site milestones.
                  </p>
                </div>
                <div className="welcome-badge-accent">
                  <Sparkles size={20} />
                  <span>Account Active</span>
                </div>
              </div>

              {loadingProjects ? (
                <div className="blank-surface-container">
                  <Loader2 size={32} className="spinner" />
                  <p style={{ marginTop: '12px', color: '#6d776e' }}>Loading your projects...</p>
                </div>
              ) : projects.length === 0 ? (
                <div className="no-project-card">
                  <button
                    type="button"
                    className="plus-icon-circle"
                    onClick={() => setShowCreateModal(true)}
                    title="Create your first project"
                    aria-label="Create your first project"
                  >
                    <Plus size={36} />
                  </button>
                  <h2>No projects yet</h2>
                  <p>
                    You have not created any projects yet. Click the plus sign above to start your first project
                    and begin adding field photos.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(true)}
                    className="button button-small create-trigger-btn"
                  >
                    <Plus size={16} /> Create Project
                  </button>
                </div>
              ) : (
                <div className="projects-view-area">
                  <div className="projects-header-row">
                    <h2>Your Projects ({projects.length})</h2>
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(true)}
                      className="button button-small create-trigger-btn"
                    >
                      <Plus size={16} /> Add Project
                    </button>
                  </div>

                  {activeProject && (
                    <div className="project-card-active">
                      <div className="project-card-header">
                        <div>
                          <h3 className="project-card-title">{activeProject.project_name}</h3>
                          <span className="project-card-date">
                            Created {activeProject.created_at ? new Date(activeProject.created_at).toLocaleDateString() : 'Recently'}
                          </span>
                        </div>
                        <div className="project-card-actions">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(activeProject)}
                            className="card-action-btn"
                            title="Edit Project"
                            aria-label="Edit Project"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setProjectToDelete(activeProject)}
                            className="card-action-btn delete-btn"
                            title="Remove Project"
                            aria-label="Remove Project"
                          >
                            <Trash2 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenFolderId(activeProject.id)
                              setActiveScreen('add-files')
                            }}
                            className="button button-small"
                            style={{ padding: '8px 16px', fontSize: '13px' }}
                          >
                            Open Folder <ArrowRight size={14} style={{ marginLeft: '4px' }} />
                          </button>
                        </div>
                      </div>

                      <p className="project-card-desc">
                        {activeProject.project_description || 'No description provided for this project.'}
                      </p>

                      <div className="project-meta-grid">
                        <div className="meta-block">
                          <span className="meta-label">People Involved</span>
                          <span className="meta-content">
                            {activeProject.people || 'No members listed'}
                          </span>
                        </div>
                        <div className="meta-block">
                          <span className="meta-label">Project Goals</span>
                          <span className="meta-content">
                            {activeProject.goals || 'No goals set'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {projects.length > 1 && (
                    <div>
                      <h3 style={{ fontSize: '16px', color: '#333', marginBottom: '12px' }}>
                        Switch Project
                      </h3>
                      <div className="project-list-grid">
                        {projects.map((p) => {
                          const isSelected = p.id === selectedProjectId
                          return (
                            <div
                              key={p.id}
                              onClick={() => setSelectedProjectId(p.id)}
                              className={`project-mini-card ${isSelected ? 'is-active-project' : ''}`}
                            >
                              <div className="mini-card-top">
                                <h3>{p.project_name}</h3>
                                <p>{p.project_description || 'No description'}</p>
                              </div>
                              <div className="mini-card-footer">
                                <span>{p.people ? `${p.people.split(',').length} people` : 'Solo'}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleOpenEdit(p)
                                    }}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6d776e' }}
                                    title="Edit"
                                  >
                                    <Pencil size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setProjectToDelete(p)
                                    }}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}
                                    title="Remove"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                  {isSelected ? (
                                    <span style={{ color: '#188f70', fontWeight: '600' }}>Active</span>
                                  ) : (
                                    <span>Select</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeScreen === 'add-files' && (
            <div className="add-files-screen">
              {projects.length === 0 ? (
                <div className="blocked-upload-card">
                  <div className="blocked-icon-circle">
                    <Lock size={34} />
                  </div>
                  <h2>Create a project first</h2>
                  <p>
                    You cannot add field images until a project is created. Create your first project now
                    to give your uploads a home.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(true)}
                    className="button button-small create-trigger-btn"
                  >
                    <Plus size={16} /> Create Project Now
                  </button>
                </div>
              ) : openFolderId === null ? (
                <div className="drive-root-view">
                  <div className="drive-toolbar-card">
                    <div>
                      <h2>Drive Folders</h2>
                      <p>Select a project folder below to explore its media evidence or upload photos.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(true)}
                      className="button button-small"
                    >
                      <Plus size={16} /> New Project Folder
                    </button>
                  </div>

                  <div className="drive-folders-grid">
                    {projects.map((p) => (
                      <div
                        key={p.id}
                        className="drive-folder-card"
                        onClick={() => setOpenFolderId(p.id)}
                      >
                        <div className="folder-card-icon-area">
                          <Folder size={40} className="folder-svg-icon" />
                          <span className="folder-bucket-tag">bucket #{p.id}</span>
                        </div>
                        <div className="folder-card-body">
                          <h3 className="folder-title truncate">{p.project_name}</h3>
                          <p className="folder-desc truncate">{p.project_description || 'Project repository'}</p>
                        </div>
                        <div className="folder-card-footer">
                          <span>{p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Active'}</span>
                          <span className="folder-open-action">
                            Open <ChevronRight size={14} />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="drive-folder-view pb-16">
                  <div className="folder-navigation-header">
                    <div className="folder-breadcrumbs">
                      <button
                        type="button"
                        onClick={() => setOpenFolderId(null)}
                        className="crumb-btn crumb-root"
                      >
                        <HardDrive size={15} /> Drive Folders
                      </button>
                      <span className="crumb-divider">/</span>
                      <span className="crumb-active">{currentOpenFolderProject?.project_name}</span>
                    </div>

                    <div className="folder-action-buttons">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => handleFilesSelected(e.target.files)}
                        multiple
                        accept="image/*"
                        className="hidden-file-input"
                        id="folder-image-upload"
                      />
                      <label
                        htmlFor="folder-image-upload"
                        className="button button-small upload-trigger-button"
                      >
                        <UploadCloud size={16} /> Upload Images
                      </label>
                    </div>
                  </div>

                  {selectedImageIds.length > 0 && (
                    <div className="batch-action-bar">
                      <div className="batch-action-left">
                        <button
                          type="button"
                          onClick={handleSelectAll}
                          className="batch-btn"
                        >
                          {selectedImageIds.length === sortedMedia.length ? (
                            <>
                              <CheckSquare size={15} /> Deselect All
                            </>
                          ) : (
                            <>
                              <Square size={15} /> Select All ({sortedMedia.length})
                            </>
                          )}
                        </button>
                        <span className="batch-counter-badge">
                          {selectedImageIds.length} of {sortedMedia.length} selected
                        </span>
                      </div>

                      <div className="batch-action-right">
                        <button
                          type="button"
                          onClick={handleOpenBatchRename}
                          className="button button-small batch-rename-btn"
                        >
                          <Pencil size={14} /> Edit Name
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowBatchDeleteModal(true)}
                          className="button button-small danger-btn batch-delete-btn"
                        >
                          <Trash2 size={14} /> Delete Selected
                        </button>
                        <button
                          type="button"
                          onClick={handleClearSelection}
                          className="batch-cancel-btn"
                          title="Clear selection"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="folder-control-strip">
                    <div className="filter-group">
                      <span className="control-label">
                        <Filter size={14} /> Categorize By:
                      </span>
                      <select
                        value={categorizeBy}
                        onChange={(e) => setCategorizeBy(e.target.value)}
                        className="control-select"
                      >
                        <option value="none">None (Single Gallery)</option>
                        <option value="group">Batch Groups (with Solo)</option>
                        <option value="date">Capture Date</option>
                      </select>
                    </div>

                    <div className="filter-group">
                      <span className="control-label">
                        <ArrowUpDown size={14} /> Sort By:
                      </span>
                      <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        className="control-select"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="name_asc">Name (A to Z)</option>
                        <option value="name_desc">Name (Z to A)</option>
                        <option value="size_desc">File Size (Largest)</option>
                        <option value="gps_first">GPS Verified First</option>
                        <option value="ai_first">AI Flagged First</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {sortedMedia.length > 0 && selectedImageIds.length === 0 && (
                        <button
                          type="button"
                          onClick={handleSelectAll}
                          className="batch-btn"
                          style={{ padding: '4px 10px', fontSize: '12px' }}
                        >
                          <CheckSquare size={13} /> Select All
                        </button>
                      )}
                      <div className="folder-stats-pill">
                        <span>{projectMedia.length} total images</span>
                      </div>
                    </div>
                  </div>

                  {loadingMedia ? (
                    <div className="blank-surface-container">
                      <Loader2 size={32} className="spinner" />
                      <p style={{ marginTop: '12px', color: '#6d776e' }}>Loading media files...</p>
                    </div>
                  ) : projectMedia.length === 0 ? (
                    <div className="dropzone-box" style={{ marginTop: '20px' }}>
                      <div className="dropzone-icon">
                        <UploadCloud size={48} />
                      </div>
                      <h3>This folder is currently empty</h3>
                      <p>Upload photos from your site activities (maximum 5MB per image).</p>
                      <label htmlFor="folder-image-upload" className="button button-small dropzone-select-btn">
                        Select Images to Upload
                      </label>
                    </div>
                  ) : (
                    <div className="media-categories-container">
                      {categorizedGroups.map((cat) => (
                        <div key={cat.key} className="media-group-section">
                          {cat.title && (
                            <div className="media-group-header">
                              <div className="group-title-wrap">
                                <h3>{cat.title}</h3>
                                {cat.badge && <span className="group-count-pill">{cat.badge}</span>}
                              </div>
                            </div>
                          )}

                          <div className="media-gallery-grid">
                            {cat.items.map((item) => {
                              const overallIndex = sortedMedia.findIndex((m) => m.id === item.id)
                              const isItemIndexed = item.is_ai_indexed || (overallIndex < mockIndexedCount)
                              const meta = item.metadata || {}
                              const hasGps =
                                meta.latitude !== null &&
                                meta.latitude !== undefined &&
                                meta.longitude !== null &&
                                meta.longitude !== undefined
                              const rawLoc = meta.location_name || resolvedLocations[item.id] || null
                              const displayLoc = formatLocationText(rawLoc, meta.latitude, meta.longitude)
                              const isSelected = selectedImageIds.includes(item.id)

                              return (
                                <div
                                  key={item.id}
                                  className={`media-item-card ${isSelected ? 'is-card-selected' : ''}`}
                                  onClick={() => {
                                    if (selectedImageIds.length > 0) {
                                      handleToggleSelect(item.id)
                                    } else {
                                      setLightboxIndex(overallIndex)
                                    }
                                  }}
                                >
                                  <div className="media-thumb-wrap">
                                    <img
                                      src={getMediaUrl(item.thumbnail_url || item.image_url)}
                                      alt={item.display_name}
                                      className="media-thumb-img"
                                      loading="lazy"
                                    />

                                    <button
                                      type="button"
                                      className={`card-select-checkbox ${isSelected ? 'is-checked' : ''}`}
                                      onClick={(e) => handleToggleSelect(item.id, e)}
                                      title={isSelected ? 'Deselect image' : 'Select image'}
                                    >
                                      {isSelected ? <Check size={13} /> : null}
                                    </button>

                                    <div className="media-hover-actions">
                                      <button
                                        type="button"
                                        className="hover-action-btn"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setLightboxIndex(overallIndex)
                                        }}
                                        title="View Fullscreen"
                                      >
                                        <Eye size={15} />
                                      </button>
                                      <button
                                        type="button"
                                        className="hover-action-btn"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setEditImageTarget(item)
                                          setEditImageName(item.display_name)
                                        }}
                                        title="Rename"
                                      >
                                        <Pencil size={15} />
                                      </button>
                                      <button
                                        type="button"
                                        className="hover-action-btn delete-hover-btn"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setImageToDelete(item)
                                        }}
                                        title="Delete"
                                      >
                                        <Trash2 size={15} />
                                      </button>
                                    </div>
                                  </div>

                                  <div className="media-info-body">
                                    <h4 className="media-display-name truncate flex items-center gap-1.5" title={item.display_name}>
                                      {isItemIndexed && (
                                        <Sparkles size={13} className="text-emerald-600 shrink-0" />
                                      )}
                                      <span className="truncate">{item.display_name}</span>
                                    </h4>
                                    {hasGps && (
                                      <div
                                        className="media-location-tag truncate"
                                        title={displayLoc}
                                        style={displayLoc === 'Location unavailable' ? { color: '#7c877d' } : {}}
                                      >
                                        <MapPin size={11} className="flex-shrink-0" />
                                        <span className="truncate">{displayLoc}</span>
                                      </div>
                                    )}
                                    <div className="media-meta-row">
                                      <span className="media-filesize">{formatBytes(item.file_size)}</span>
                                      <span className="media-date">
                                        {formatDisplayDate(item.captured_at) || formatDisplayDate(item.upload_time) || ''}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <IndexingStatusBar
                    totalImages={projectMedia.length}
                    indexedCount={mockIndexedCount}
                    isIndexing={isSimulatingIndexing}
                    isCollapsed={isCollapsed}
                    onSimulateToggle={handleSimulateToggle}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {showNameModal && (
        <div className="modal-backdrop">
          <div className="modal-window">
            <div className="modal-header">
              <div>
                <h2>
                  {pendingFiles.length > 1
                    ? `Assign Group Name (${pendingFiles.length} images)`
                    : 'Assign Display Name'}
                </h2>
                <p>
                  {pendingFiles.length > 1
                    ? 'All images in this upload batch will share this group name for simple identification.'
                    : 'Enter a friendly display name for this image.'}
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowNameModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-form">
              <div className="form-group">
                <label htmlFor="batch-name">
                  {pendingFiles.length > 1 ? 'Group Name *' : 'Display Name *'}
                </label>
                <input
                  id="batch-name"
                  type="text"
                  value={batchNameDraft}
                  onChange={(e) => setBatchNameDraft(e.target.value)}
                  placeholder="e.g. Northeast Check Dam Survey"
                  autoFocus
                  style={{
                    height: '44px',
                    padding: '10px 14px',
                    border: '1px solid #dcd7cc',
                    borderRadius: '10px',
                    background: '#faf9f6',
                    fontSize: '14px',
                    color: '#292c29'
                  }}
                />
              </div>

              <div className="selected-files-preview-list">
                <span className="preview-label">Queued files:</span>
                <div className="preview-items-scroll">
                  {pendingFiles.slice(0, 6).map((f, i) => (
                    <div key={i} className="preview-file-chip">
                      <span className="truncate">{f.name}</span>
                      <span className="chip-size">{formatBytes(f.size)}</span>
                    </div>
                  ))}
                  {pendingFiles.length > 6 && (
                    <span className="more-chips-text">+{pendingFiles.length - 6} more</span>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="button button-small cancel-btn"
                  onClick={() => setShowNameModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="button button-small"
                  onClick={handleConfirmBatchUpload}
                >
                  Confirm & Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUploadDrawer && uploadQueue.length > 0 && (
        <div className="upload-dock-widget">
          <div className="upload-dock-header">
            <div className="dock-header-title">
              <UploadCloud size={16} />
              <span>
                Uploading ({uploadQueue.filter((q) => q.status === 'completed').length}/{uploadQueue.length})
              </span>
            </div>
            <div className="dock-header-actions">
              <button
                type="button"
                onClick={() => setUploadQueue((prev) => prev.filter((q) => q.status === 'uploading' || q.status === 'pending'))}
                className="dock-clear-btn"
                title="Clear completed"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setShowUploadDrawer(false)}
                className="dock-close-btn"
                title="Minimize drawer"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          <div className="upload-dock-list">
            {uploadQueue.map((item) => (
              <div key={item.id} className="upload-dock-item">
                <div className="dock-item-info">
                  <span className="dock-item-name truncate">{item.file.name}</span>
                  <span className="dock-item-size">{formatBytes(item.file.size)}</span>
                </div>

                <div className="dock-item-progress-bar">
                  <div
                    className={`dock-item-progress-fill ${
                      item.status === 'completed'
                        ? 'fill-complete'
                        : item.status === 'error'
                        ? 'fill-error'
                        : 'fill-active'
                    }`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>

                <div className="dock-item-status-row">
                  {item.status === 'completed' ? (
                    <span className="status-text text-complete">
                      <CheckCircle size={12} /> Complete
                    </span>
                  ) : item.status === 'error' ? (
                    <span className="status-text text-error">
                      <AlertTriangle size={12} /> {item.error || 'Failed'}
                    </span>
                  ) : item.status === 'uploading' ? (
                    <span className="status-text text-uploading">
                      <Loader2 size={12} className="spinner" /> {item.progress}%
                    </span>
                  ) : (
                    <span className="status-text text-pending">Pending in queue</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {lightboxIndex !== null && (
        <Lightbox
          images={sortedMedia.map((m, idx) => ({
            ...m,
            is_ai_indexed: m.is_ai_indexed || (idx < mockIndexedCount)
          }))}
          currentIndex={lightboxIndex}
          resolvedLocations={resolvedLocations}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(newIdx) => setLightboxIndex(newIdx)}
          onUpdateDisplayName={handleUpdateImageName}
          onDeleteImage={handleDeleteImage}
        />
      )}

      {editImageTarget && (
        <div className="modal-backdrop">
          <div className="modal-window confirm-box">
            <div className="modal-header">
              <h2>Rename Image</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setEditImageTarget(null)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label htmlFor="rename-input">Display Name</label>
                <input
                  id="rename-input"
                  type="text"
                  value={editImageName}
                  onChange={(e) => setEditImageName(e.target.value)}
                  autoFocus
                  style={{
                    height: '42px',
                    padding: '8px 12px',
                    border: '1px solid #dcd7cc',
                    borderRadius: '8px',
                    background: '#faf9f6',
                    fontSize: '14px',
                    color: '#292c29'
                  }}
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="button button-small cancel-btn"
                  onClick={() => setEditImageTarget(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="button button-small"
                  disabled={savingImageName || !editImageName.trim()}
                  onClick={async () => {
                    setSavingImageName(true)
                    await handleUpdateImageName(editImageTarget.id, editImageName.trim())
                    setSavingImageName(false)
                    setEditImageTarget(null)
                  }}
                >
                  {savingImageName ? 'Saving...' : 'Save Name'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {imageToDelete && (
        <div className="modal-backdrop">
          <div className="modal-window confirm-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#dc2626', marginBottom: '12px' }}>
              <AlertTriangle size={24} />
              <h2 style={{ margin: 0 }}>Delete Image?</h2>
            </div>
            <p>
              Are you sure you want to permanently delete <strong>{imageToDelete.display_name}</strong>?
              Both the full resolution image and thumbnail will be removed from the project bucket.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="button button-small cancel-btn"
                onClick={() => setImageToDelete(null)}
                disabled={deletingImage}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button button-small danger-btn"
                onClick={async () => {
                  setDeletingImage(true)
                  await handleDeleteImage(imageToDelete.id)
                  setDeletingImage(false)
                }}
                disabled={deletingImage}
              >
                {deletingImage ? 'Deleting...' : 'Yes, Delete Image'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showBatchRenameModal && (
        <div className="modal-backdrop">
          <div className="modal-window confirm-box">
            <div className="modal-header">
              <div>
                <h2>Rename {selectedImageIds.length} Selected Images</h2>
                <p>Assign a shared display name to all selected items.</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowBatchRenameModal(false)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label htmlFor="batch-rename-input">New Display Name *</label>
                <input
                  id="batch-rename-input"
                  type="text"
                  value={batchRenameDraft}
                  onChange={(e) => setBatchRenameDraft(e.target.value)}
                  autoFocus
                  style={{
                    height: '42px',
                    padding: '8px 12px',
                    border: '1px solid #dcd7cc',
                    borderRadius: '8px',
                    background: '#faf9f6',
                    fontSize: '14px',
                    color: '#292c29'
                  }}
                />
              </div>
              <p style={{ fontSize: '12px', color: '#6d776e', marginTop: '-4px' }}>
                All {selectedImageIds.length} selected images will be updated with this display name.
              </p>
              <div className="modal-actions">
                <button
                  type="button"
                  className="button button-small cancel-btn"
                  onClick={() => setShowBatchRenameModal(false)}
                  disabled={savingBatchRename}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="button button-small"
                  disabled={savingBatchRename || !batchRenameDraft.trim()}
                  onClick={handleConfirmBatchRename}
                >
                  {savingBatchRename ? 'Updating...' : 'Save Name'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showBatchDeleteModal && (
        <div className="modal-backdrop">
          <div className="modal-window confirm-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#dc2626', marginBottom: '12px' }}>
              <AlertTriangle size={24} />
              <h2 style={{ margin: 0 }}>Delete {selectedImageIds.length} Images?</h2>
            </div>
            <p>
              Are you sure you want to permanently delete <strong>{selectedImageIds.length} selected images</strong>?
              Both the full resolution images and thumbnails will be removed from the project bucket.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="button button-small cancel-btn"
                onClick={() => setShowBatchDeleteModal(false)}
                disabled={deletingBatch}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button button-small danger-btn"
                onClick={handleConfirmBatchDelete}
                disabled={deletingBatch}
              >
                {deletingBatch ? 'Deleting...' : `Yes, Delete ${selectedImageIds.length} Images`}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Create New Project</h2>
                <p>Add a project name, description, people, and goals.</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowCreateModal(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="login-alert error-alert" style={{ marginBottom: '14px' }}>
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="proj-name">Project Name *</label>
                <input
                  id="proj-name"
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Jharkhand Watershed Restoration"
                  required
                  style={{
                    height: '44px',
                    padding: '10px 14px',
                    border: '1px solid #dcd7cc',
                    borderRadius: '10px',
                    background: '#faf9f6',
                    fontSize: '14px',
                    color: '#292c29'
                  }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="proj-desc">Project Description</label>
                <textarea
                  id="proj-desc"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="What is the purpose and scope of this field initiative?"
                />
              </div>

              <div className="form-group">
                <label htmlFor="proj-people">People Involved</label>
                <input
                  id="proj-people"
                  type="text"
                  value={people}
                  onChange={(e) => setPeople(e.target.value)}
                  placeholder="e.g. Aarav Sharma, Priya Patel"
                  style={{
                    height: '44px',
                    padding: '10px 14px',
                    border: '1px solid #dcd7cc',
                    borderRadius: '10px',
                    background: '#faf9f6',
                    fontSize: '14px',
                    color: '#292c29'
                  }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="proj-goals">Goals</label>
                <input
                  id="proj-goals"
                  type="text"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  placeholder="e.g. Build 4 check dams, verify 50 baseline photos"
                  style={{
                    height: '44px',
                    padding: '10px 14px',
                    border: '1px solid #dcd7cc',
                    borderRadius: '10px',
                    background: '#faf9f6',
                    fontSize: '14px',
                    color: '#292c29'
                  }}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="button button-small cancel-btn"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button button-small"
                  disabled={submitting}
                >
                  {submitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Edit Project</h2>
                <p>Update project details, members, or goals.</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowEditModal(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {editError && (
              <div className="login-alert error-alert" style={{ marginBottom: '14px' }}>
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="edit-proj-name">Project Name *</label>
                <input
                  id="edit-proj-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  style={{
                    height: '44px',
                    padding: '10px 14px',
                    border: '1px solid #dcd7cc',
                    borderRadius: '10px',
                    background: '#faf9f6',
                    fontSize: '14px',
                    color: '#292c29'
                  }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-proj-desc">Project Description</label>
                <textarea
                  id="edit-proj-desc"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-proj-people">People Involved</label>
                <input
                  id="edit-proj-people"
                  type="text"
                  value={editPeople}
                  onChange={(e) => setEditPeople(e.target.value)}
                  style={{
                    height: '44px',
                    padding: '10px 14px',
                    border: '1px solid #dcd7cc',
                    borderRadius: '10px',
                    background: '#faf9f6',
                    fontSize: '14px',
                    color: '#292c29'
                  }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-proj-goals">Goals</label>
                <input
                  id="edit-proj-goals"
                  type="text"
                  value={editGoals}
                  onChange={(e) => setEditGoals(e.target.value)}
                  style={{
                    height: '44px',
                    padding: '10px 14px',
                    border: '1px solid #dcd7cc',
                    borderRadius: '10px',
                    background: '#faf9f6',
                    fontSize: '14px',
                    color: '#292c29'
                  }}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="button button-small cancel-btn"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button button-small"
                  disabled={editSubmitting}
                >
                  {editSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {projectToDelete && (
        <div className="modal-backdrop" onClick={() => setProjectToDelete(null)}>
          <div className="modal-window confirm-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#dc2626', marginBottom: '12px' }}>
              <AlertTriangle size={24} />
              <h2 style={{ margin: 0 }}>Remove Project?</h2>
            </div>
            <p>
              Are you sure you want to remove <strong>{projectToDelete.project_name}</strong>?
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="button button-small cancel-btn"
                onClick={() => setProjectToDelete(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button button-small danger-btn"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? 'Removing...' : 'Yes, Remove Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
