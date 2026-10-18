import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  ArrowLeft, Building2, Home, Users, Layers, PawPrint, IndianRupee, Star, Shield,
  FileText, ShieldCheck, ShieldX, Clock, CheckCircle, Ban, Eye, X, ZoomIn, Award,
  Flame, BadgeCheck, Loader2,
} from 'lucide-react'
import { normalizeHost } from '../../utils/normalizeHost'
import { resolveHostIdForUser, getHostById, updateHostAdmin } from '../../services/hostService'
import { getUserById } from '../../services/userService'
import { formatDate } from '../../utils/formatDate'

const PET_LABEL = { dogs: 'Dogs', cats: 'Cats', birds: 'Birds', small: 'Small Pets' }

// Map the host's listing status onto the three states the UI knows about.
const LISTING_STATUS = {
  verified: { cls: 'bg-success/10 text-success border border-success/20', Icon: ShieldCheck, label: 'Verified' },
  rejected: { cls: 'bg-error/10 text-error border border-error/20',       Icon: ShieldX,     label: 'Rejected' },
  pending:  { cls: 'bg-yellow-50 text-yellow-700 border border-yellow-200', Icon: Clock,     label: 'Pending'  },
}
const normStatus = (s) => {
  const v = String(s || '').toLowerCase()
  if (v === 'verified' || v === 'approved') return 'verified'
  if (v === 'rejected') return 'rejected'
  return 'pending'
}

function SectionCard({ icon: Icon, title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100 bg-gray-50/60">
        <div className="w-7 h-7 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
          <Icon size={14} className="text-secondary" />
        </div>
        <h2 className="font-bold text-gray-800 text-sm">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function InfoRow({ label, value }) {
  if (value === undefined || value === null || value === '') return null
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-4 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide sm:w-40 shrink-0">{label}</span>
      <span className="text-sm text-gray-800 font-medium">{value}</span>
    </div>
  )
}

function Tag({ children }) {
  return (
    <span className="inline-block px-2.5 py-1 bg-secondary/8 text-secondary text-xs font-semibold rounded-full border border-secondary/15">
      {children}
    </span>
  )
}

function Toggle({ checked, onChange, label, description, icon: Icon, disabled }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${checked ? 'bg-secondary/10' : 'bg-gray-100'}`}>
          <Icon size={15} className={checked ? 'text-secondary' : 'text-gray-400'} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">{label}</p>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
      </div>
      <button
        onClick={onChange}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
          checked ? 'bg-secondary' : 'bg-gray-200'
        }`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`} />
      </button>
    </div>
  )
}

export default function HostProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const passedHostId = location.state?.hostId || null

  const [user, setUser] = useState(null)
  const [host, setHost] = useState(null)
  const [rawHost, setRawHost] = useState(null)
  const [hostId, setHostId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [listingStatus, setListingStatus] = useState('pending')
  const [updating, setUpdating] = useState(false)

  const [previewDoc, setPreviewDoc] = useState(null)
  const [rejectModal, setRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [suspendModal, setSuspendModal] = useState(false)
  const [suspendReason, setSuspendReason] = useState('')

  // Badge / account state — synced with the API via updateHostAdmin.
  const [physicalVerified, setPhysicalVerified] = useState(false)
  const [isTopHost, setIsTopHost] = useState(false)
  const [isMostPopular, setIsMostPopular] = useState(false)
  const [accountStatus, setAccountStatus] = useState('active')
  const [savingField, setSavingField] = useState(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      const token = localStorage.getItem('token')
      try {
        const u = await getUserById(id).catch(() => null)
        if (active) setUser(u)

        // Resolve the hostId without scanning the host list where possible:
        //   1. hostId passed via navigation from User Management (fastest).
        //   2. hostId embedded in the user record (works for unverified hosts,
        //      which never appear in the public host list).
        //   3. Fall back to scanning the host list (verified hosts only).
        let hid = passedHostId || u?.hostId || null
        if (!hid) hid = await resolveHostIdForUser(id, token).catch(() => null)
        if (hid) {
          const raw = await getHostById(hid).catch(() => null)
          if (active && raw) {
            setHostId(hid)
            setRawHost(raw)
            const normalized = normalizeHost(raw)
            setHost(normalized)
            setListingStatus(normStatus(normalized.status))
            setPhysicalVerified(!!raw.physicalverification)
            setIsTopHost(!!raw.topRated)
            setIsMostPopular(!!raw.mostPopullar)
            setAccountStatus(raw.accountSuspendReason ? 'suspended' : 'active')
          }
        } else if (active && !u) {
          setNotFound(true)
        }
      } catch (err) {
        console.error('Failed to load host profile', err)
        if (active) setNotFound(true)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [id])

  const handleVerify = async () => {
    if (!hostId) return
    setUpdating(true)
    try {
      await updateHostAdmin(hostId, { status: 'verified' }, id)
      setListingStatus('verified')
      toast.success('Host verified — listing is now live.')
    } catch (err) {
      console.error('Verify failed', err)
      toast.error(err?.response?.data?.message || 'Failed to verify host.')
    } finally {
      setUpdating(false)
    }
  }

  const handleReject = async () => {
    if (!hostId) return
    setUpdating(true)
    try {
      await updateHostAdmin(hostId, { status: 'rejected' }, id)
      setListingStatus('rejected')
      toast.error('Host rejected — listing is hidden from customers.')
      setRejectModal(false)
      setRejectReason('')
    } catch (err) {
      console.error('Reject failed', err)
      toast.error(err?.response?.data?.message || 'Failed to reject host.')
    } finally {
      setUpdating(false)
    }
  }

  const handleSuspend = async () => {
    if (!hostId) return
    setUpdating(true)
    try {
      // Suspending also unverifies the listing (status → rejected) so the host
      // disappears from the customer listing page, which only shows hosts whose
      // status is 'verified'. Both are sent in one admin update.
      await updateHostAdmin(hostId, { accountSuspendReason: suspendReason.trim(), status: 'rejected' }, id)
      setAccountStatus('suspended')
      setListingStatus('rejected')
      toast.error(`${name} suspended — listing hidden from customers.`)
      setSuspendModal(false)
      setSuspendReason('')
    } catch (err) {
      console.error('Suspend failed', err)
      toast.error(err?.response?.data?.message || 'Failed to suspend host.')
    } finally {
      setUpdating(false)
    }
  }

  const handleActivate = async () => {
    if (!hostId) return
    setUpdating(true)
    try {
      // Re-activating clears the suspension and re-verifies the listing so it
      // shows on the customer listing page again.
      await updateHostAdmin(hostId, { accountSuspendReason: '', status: 'verified' }, id)
      setAccountStatus('active')
      setListingStatus('verified')
      toast.success(`${name} activated — listing is live again.`)
    } catch (err) {
      console.error('Activate failed', err)
      toast.error(err?.response?.data?.message || 'Failed to activate host.')
    } finally {
      setUpdating(false)
    }
  }

  // Toggle a badge field, updating the API then local state (reverts on error).
  const toggleBadge = async (field, current, setter, label) => {
    if (!hostId) return
    const next = !current
    setSavingField(field)
    try {
      await updateHostAdmin(hostId, { [field]: next }, id)
      setter(next)
      toast.success(`${label} ${next ? 'enabled' : 'removed'}.`)
    } catch (err) {
      console.error('Badge update failed', err)
      toast.error(err?.response?.data?.message || `Failed to update ${label}.`)
    } finally {
      setSavingField(null)
    }
  }

  // Top Host and Most Popular are mutually exclusive — a host can hold at most
  // one of these two prominence badges. Enabling one clears the other (in the
  // same API call and in local state); disabling just removes it.
  const toggleExclusiveBadge = async (field) => {
    if (!hostId) return
    const isTop = field === 'topRated'
    const current = isTop ? isTopHost : isMostPopular
    const other = isTop ? 'mostPopullar' : 'topRated'
    const next = !current
    const label = isTop ? 'Premium Stay' : 'Most Popular'
    setSavingField(field)
    try {
      // One PUT carries the change: set this badge, and when enabling also clear
      // the other so the two stay mutually exclusive. Booleans are sent as real
      // booleans so `mostPopullar: true` lands in the request body verbatim.
      const body = next ? { [field]: true, [other]: false } : { [field]: false }
      await updateHostAdmin(hostId, body, id)
      if (isTop) {
        setIsTopHost(next)
        if (next) setIsMostPopular(false)
      } else {
        setIsMostPopular(next)
        if (next) setIsTopHost(false)
      }
      toast.success(`${label} ${next ? 'enabled' : 'removed'}.`)
    } catch (err) {
      console.error('Badge update failed', err)
      toast.error(err?.response?.data?.message || `Failed to update ${label}.`)
    } finally {
      setSavingField(null)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center py-24 text-gray-400">
        <Loader2 size={28} className="animate-spin" />
      </div>
    )
  }

  if (notFound && !user && !host) {
    return (
      <div className="p-6 text-center text-gray-400">
        Host not found.{' '}
        <button onClick={() => navigate('/admin/users')} className="text-secondary underline">Go back</button>
      </div>
    )
  }

  const name = user?.name || host?.name || 'Host'
  const petTypes = (host?.pets || []).map(p => PET_LABEL[p] || p)
  const statusCfg = LISTING_STATUS[listingStatus]

  // Documents from the host record. The API returns URL arrays:
  // idProof[front, back], addressProof[url], noc[url], businessProof[gomasta, udyam, gst].
  const arr = (v) => (Array.isArray(v) ? v : v ? [v] : [])
  const asUrl = (v) => (typeof v === 'string' ? v : v?.url || v?.previewUrl || v?.fileUrl || v?.imageUrl || '')
  const idProof = arr(rawHost?.idProof)
  const addressProof = arr(rawHost?.addressProof)
  const noc = arr(rawHost?.noc)
  const businessProof = arr(rawHost?.businessProof)
  const documents = [
    { name: 'Aadhaar Card (Front)', type: 'ID Proof',       previewUrl: asUrl(idProof[0]) },
    { name: 'Aadhaar Card (Back)',  type: 'ID Proof',       previewUrl: asUrl(idProof[1]) },
    { name: 'Address Proof',        type: 'Address Proof',  previewUrl: asUrl(addressProof[0]) },
    { name: 'NOC',                  type: 'NOC',            previewUrl: asUrl(noc[0]) },
    { name: 'Gomasta / Shop License', type: 'Business Proof', previewUrl: asUrl(businessProof[0]) },
    { name: 'Udyam Certificate',    type: 'Business Proof', previewUrl: asUrl(businessProof[1]) },
    { name: 'GST Certificate',      type: 'Business Proof', previewUrl: asUrl(businessProof[2]) },
  ].filter(d => d.previewUrl).map((d, i) => ({ id: i, submitted: '', ...d }))

  const facilities = host?.facilities || []

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/admin/users')}
          className="p-2 rounded-xl border border-gray-200 hover:border-secondary hover:text-secondary text-gray-500 transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{name}</h1>
            {physicalVerified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary/10 text-secondary text-xs font-bold rounded-full border border-secondary/20">
                <BadgeCheck size={11} /> Verified
              </span>
            )}
            {isTopHost && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
                <Star size={11} /> Premium Stay
              </span>
            )}
            {isMostPopular && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-600 text-xs font-bold rounded-full border border-orange-200">
                <Flame size={11} /> Most Popular
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm mt-0.5">Host Profile &amp; Verification</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${statusCfg.cls}`}>
            <statusCfg.Icon size={12} /> Status: {statusCfg.label}
          </span>
          <button
            onClick={() => accountStatus === 'active' ? setSuspendModal(true) : handleActivate()}
            disabled={updating || !hostId}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60 ${
              accountStatus === 'active'
                ? 'bg-error/10 text-error hover:bg-error hover:text-white'
                : 'bg-success/10 text-success hover:bg-success hover:text-white'
            }`}
          >
            {accountStatus === 'active' ? <><Ban size={12} /> Suspend</> : <><CheckCircle size={12} /> Activate</>}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Personal Info */}
        <SectionCard icon={Users} title="Personal Information">
          <InfoRow label="Full Name" value={user?.name} />
          <InfoRow label="Email"     value={user?.email} />
          <InfoRow label="Phone"     value={rawHost?.phone || rawHost?.mobile || rawHost?.contactNumber} />
          <InfoRow label="City"      value={host?.city} />
          <InfoRow label="Address"   value={host?.fullAddress} />
          <InfoRow label="Pincode"   value={rawHost?.address?.pincode} />
          <InfoRow label="Joined On" value={formatDate(user?.joined)} />
          <InfoRow label="Account Status" value={
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
              accountStatus === 'active' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
            }`}>{accountStatus}</span>
          } />
          {host?.bio && (
            <div className="pt-3 mt-1 border-t border-gray-50">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">About</p>
              <p className="text-sm text-gray-700 leading-relaxed">{host.bio}</p>
            </div>
          )}
        </SectionCard>

        {/* Property Details */}
        {host && (
          <SectionCard icon={Building2} title="Property Details">
            <InfoRow label="Business Owner Name" value={host.businessName || host.name} />
            <InfoRow label="Stay Type" value={host.businessTypeLabel || host.businessType} />
            <InfoRow label="Ownership"     value={rawHost?.ownershipType} />
            <InfoRow label="Caretakers"    value={host.numberOfCareTakers} />
            <InfoRow label="Area Size"     value={host.propertyAreaSize} />
            {host.rules && (
              <div className="pt-3 mt-1 border-t border-gray-50">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">House Rules</p>
                <p className="text-sm text-gray-700 leading-relaxed">{host.rules}</p>
              </div>
            )}
          </SectionCard>
        )}

        {/* Capacity & Facilities */}
        {facilities.length > 0 && (
          <SectionCard icon={Home} title="Capacity & Facilities">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 uppercase">
                    <th className="py-2 pr-4">Pet</th>
                    <th className="py-2 pr-4">Capacity</th>
                    <th className="py-2 pr-4">Rooms</th>
                    <th className="py-2 pr-4">Cages</th>
                    <th className="py-2 pr-4">Room Area</th>
                    <th className="py-2">Cage Size</th>
                  </tr>
                </thead>
                <tbody>
                  {facilities.map(f => (
                    <tr key={f.petType} className="border-t border-gray-50">
                      <td className="py-2 pr-4 font-medium text-gray-800">{f.emoji} {f.label}</td>
                      <td className="py-2 pr-4 text-gray-600">{f.capacity ?? '—'}</td>
                      <td className="py-2 pr-4 text-gray-600">{f.rooms ?? '—'}</td>
                      <td className="py-2 pr-4 text-gray-600">{f.cages ?? '—'}</td>
                      <td className="py-2 pr-4 text-gray-600">{f.roomArea ?? '—'}</td>
                      <td className="py-2 text-gray-600">{f.cageDims ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}

        {/* Services & Pets */}
        {host && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SectionCard icon={Layers} title="Services Offered">
              <div className="flex flex-wrap gap-2">
                {(host.serviceTypes || []).map(s => <Tag key={s}>{s}</Tag>)}
                {!host.serviceTypes?.length && <p className="text-sm text-gray-400">—</p>}
              </div>
            </SectionCard>
            <SectionCard icon={PawPrint} title="Pet Types Accepted">
              <div className="flex flex-wrap gap-2">
                {petTypes.map(p => <Tag key={p}>{p}</Tag>)}
                {!petTypes.length && <p className="text-sm text-gray-400">—</p>}
              </div>
            </SectionCard>
          </div>
        )}

        {/* Pricing */}
        {host?.pricing && Object.keys(host.pricing).length > 0 && (
          <SectionCard icon={IndianRupee} title="Pricing (per night)">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Dog (Small)',  val: host.pricing.dogSmall  },
                { label: 'Dog (Medium)', val: host.pricing.dogMedium },
                { label: 'Dog (Large)',  val: host.pricing.dogLarge  },
                { label: 'Cat',          val: host.pricing.cat       },
                { label: 'Bird',         val: host.pricing.bird      },
                { label: 'Small Pet',    val: host.pricing.small     },
              ].filter(x => x.val).map(({ label, val }) => (
                <div key={label} className="p-3 bg-gray-50 rounded-xl text-center">
                  <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                  <p className="text-base font-bold text-gray-900">₹{val}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Amenities */}
        {host?.amenities?.length > 0 && (
          <SectionCard icon={Star} title="Amenities">
            <div className="flex flex-wrap gap-2">
              {host.amenities.map(a => <Tag key={a}>{a}</Tag>)}
            </div>
          </SectionCard>
        )}

        {/* Experience */}
        {host?.experience && (
          <SectionCard icon={Home} title="Experience">
            <p className="text-sm text-gray-700 leading-relaxed">{host.experience}</p>
          </SectionCard>
        )}

        {/* Document Verification + host verify/reject */}
        <SectionCard icon={Shield} title="Document Verification">
          <div className="space-y-3">
            {documents.length === 0 && (
              <p className="text-sm text-gray-400">No documents submitted.</p>
            )}
            {documents.map(doc => (
              <div key={doc.id} className="border border-gray-100 rounded-xl overflow-hidden bg-gray-50/40">
                <div className="flex items-stretch gap-0">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="relative shrink-0 w-28 h-24 bg-gray-100 overflow-hidden group border-r border-gray-100"
                    title="Click to view document"
                  >
                    <img src={doc.previewUrl} alt={doc.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <ZoomIn size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                  <div className="flex flex-col flex-1 p-3.5 gap-2 min-w-0">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{doc.type}</p>
                    </div>
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="self-start flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      <Eye size={13} /> View Doc
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Verify / Reject host (status API) */}
          {listingStatus !== 'verified' && hostId && (
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleVerify}
                disabled={updating}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-success text-white text-sm font-bold hover:bg-success/90 disabled:opacity-60 transition-colors"
              >
                {updating ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />} Verify Host
              </button>
              <button
                onClick={() => setRejectModal(true)}
                disabled={updating}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-error/10 text-error text-sm font-bold hover:bg-error hover:text-white disabled:opacity-60 transition-colors"
              >
                <ShieldX size={15} /> Reject Host
              </button>
            </div>
          )}

          {/* Overall status note */}
          <div className={`mt-4 p-3.5 rounded-xl text-xs leading-relaxed ${
            listingStatus === 'verified'
              ? 'bg-success/5 border border-success/20 text-success'
              : listingStatus === 'rejected'
              ? 'bg-error/5 border border-error/20 text-error'
              : 'bg-amber-50 border border-amber-200 text-amber-700'
          }`}>
            {listingStatus === 'verified'
              ? '✓ Host verified — property listing is live and visible to customers.'
              : listingStatus === 'rejected'
              ? '✗ Host rejected — property listing is hidden from customers.'
              : '⏳ Pending review — property listing is hidden until the host is verified.'
            }
          </div>
        </SectionCard>

        {/* Host Badges & Verification */}
        <SectionCard icon={Award} title="Host Badges & Verification">
          <Toggle
            checked={physicalVerified}
            disabled={savingField === 'physicalverification' || !hostId}
            onChange={() => toggleBadge('physicalverification', physicalVerified, setPhysicalVerified, 'Physical Verification')}
            label="Physical Verification"
            description="Mark host as physically verified — shows a Verified badge on their property"
            icon={BadgeCheck}
          />
          <Toggle
            checked={isTopHost}
            disabled={savingField === 'topRated' || !hostId}
            onChange={() => toggleExclusiveBadge('topRated')}
            label="Premium Stay"
            description="Grant Premium stay badge - displayed prominently on property listing on the basis of Property ambience and high standards"
            icon={Star}
          />
          <Toggle
            checked={isMostPopular}
            disabled={savingField === 'mostPopullar' || !hostId}
            onChange={() => toggleExclusiveBadge('mostPopullar')}
            label="Most Popular"
            description="Grant most popular badge - displayed prominently on property listing on the basis of ratings/number of bookings"
            icon={Flame}
          />
        </SectionCard>
      </div>

      {/* Document Lightbox */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setPreviewDoc(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <p className="font-bold text-gray-900">{previewDoc.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{[previewDoc.type, previewDoc.submitted && `Submitted ${previewDoc.submitted}`].filter(Boolean).join(' · ')}</p>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="bg-gray-900 flex items-center justify-center" style={{ minHeight: 340 }}>
              {previewDoc.previewUrl ? (
                <img src={previewDoc.previewUrl} alt={previewDoc.name} className="max-w-full max-h-96 object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-3 py-16 text-gray-500">
                  <FileText size={40} />
                  <p className="text-sm">No preview available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !updating && setRejectModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <p className="font-bold text-gray-900">Reject Host</p>
                <p className="text-xs text-gray-400 mt-0.5">The listing will be hidden from customers.</p>
              </div>
              <button onClick={() => setRejectModal(false)} disabled={updating} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Reason (optional)</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  placeholder="Add an internal note about why this host is being rejected…"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-error/30 focus:border-error resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setRejectModal(false)}
                  disabled={updating}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-60 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={updating}
                  className="flex-1 py-2.5 rounded-xl bg-error text-white text-sm font-bold hover:bg-error/90 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                >
                  {updating && <Loader2 size={15} className="animate-spin" />}
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {suspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !updating && setSuspendModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <p className="font-bold text-gray-900">Suspend Host</p>
                <p className="text-xs text-gray-400 mt-0.5">The host account will be suspended.</p>
              </div>
              <button onClick={() => setSuspendModal(false)} disabled={updating} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Suspension Reason <span className="text-error">*</span></label>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  rows={3}
                  placeholder="Why is this host being suspended?…"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-error/30 focus:border-error resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setSuspendModal(false)}
                  disabled={updating}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-60 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSuspend}
                  disabled={updating || !suspendReason.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-error text-white text-sm font-bold hover:bg-error/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {updating && <Loader2 size={15} className="animate-spin" />}
                  Confirm Suspend
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
