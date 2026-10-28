import { FormEvent, useEffect, useMemo, useState } from "react"
import {
  Archive,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Eye,
  EyeOff,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Package,
  Plus,
  Search,
  Settings,
  Sun,
  UserRound,
  UsersRound,
  X,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { useI18n } from "./i18n"

type Role = "admin" | "employee"
type LoginData = {
  email: string
  password: string
  role?: Role
}
type ReviewBlockProps = {
  title: string
  value: string
}
type View = "dashboard" | "employees" | "attendance" | "tasks" | "inventory" | "notifications" | "profile" | "settings"
type User = {
  name: string
  email: string
  role: Role
  employeeId: string
  position: string
  department: string
}
type Employee = {
  id: string
  name: string
  department: string
  position: string
  email: string
  status: string
  initials: string
  phone?: string
  salary?: string
  hireDate?: string
}
type Task = {
  id: number
  title: string
  assignee: string
  priority: string
  status: string
  progress: number
  due: string
  description?: string
  requiredPosition?: string
  slots?: number
  claimedBy?: string[]
}
type Item = {
  id: number
  name: string
  code: string
  category: string
  stock: number
  minimum: number
  unit: string
  location: string
}
type AttendanceRecord = {
  id: number
  employeeId: string
  date: string
  checkIn?: string
  checkOut?: string
  checkInPhoto?: string
  checkOutPhoto?: string
  status: string
  notes?: string
  demo?: boolean
}
type PerformanceReview = {
  id: number
  employeeId: string
  month: string
  status: "Draft" | "Published"
  taskSummary: string
  quality: string
  achievements: string
  improvements: string
  attendanceSummary: string
  notes: string
  recommendations: string
  createdAt: string
  updatedAt: string
}

const seedEmployees: Employee[] = [
  {
    id: "IW-001",
    name: "Olivia Martin",
    department: "Design",
    position: "Product Designer",
    email: "employee1@inwork.demo",
    status: "Active",
    initials: "OM",
    phone: "+1 202 555 0134",
    salary: "$74,000",
    hireDate: "12 Mar 2023",
  },
  {
    id: "IW-002",
    name: "James Wilson",
    department: "Engineering",
    position: "Frontend Engineer",
    email: "employee2@inwork.demo",
    status: "Active",
    initials: "JW",
    phone: "+1 202 555 0168",
    salary: "$82,500",
    hireDate: "08 Aug 2022",
  },
  {
    id: "IW-003",
    name: "Sophia Lee",
    department: "Marketing",
    position: "Growth Manager",
    email: "sophia@inwork.demo",
    status: "Active",
    initials: "SL",
    phone: "+1 202 555 0191",
    salary: "$88,000",
    hireDate: "19 Jan 2022",
  },
  {
    id: "IW-004",
    name: "Ethan Brown",
    department: "Operations",
    position: "Operations Lead",
    email: "ethan@inwork.demo",
    status: "On leave",
    initials: "EB",
    phone: "+1 202 555 0147",
    salary: "$79,500",
    hireDate: "04 Nov 2021",
  },
]
const seedTasks: Task[] = [
  {
    id: 1,
    title: "Refresh onboarding experience",
    assignee: "Olivia Martin",
    priority: "High",
    status: "In Progress",
    progress: 72,
    due: "28 Jun",
    requiredPosition: "Product Designer",
    slots: 1,
    claimedBy: ["IW-001"],
  },
  {
    id: 2,
    title: "Build dashboard components",
    assignee: "",
    priority: "Medium",
    status: "Available",
    progress: 0,
    due: "30 Jun",
    description: "Build accessible dashboard UI components.",
    requiredPosition: "Frontend Engineer",
    slots: 2,
    claimedBy: [],
  },
  {
    id: 3,
    title: "Design employee mobile flow",
    assignee: "",
    priority: "High",
    status: "Available",
    progress: 0,
    due: "02 Jul",
    description: "Design and validate the employee mobile journey.",
    requiredPosition: "Product Designer",
    slots: 1,
    claimedBy: [],
  },
]
const demoAccounts: Record<string, User> = {
  "manager@inwork.demo": {
    name: "Alex Morgan",
    email: "manager@inwork.demo",
    role: "admin",
    employeeId: "MGR-001",
    position: "People Operations Director",
    department: "People Operations",
  },
  "employee1@inwork.demo": {
    name: "Olivia Martin",
    email: "employee1@inwork.demo",
    role: "employee",
    employeeId: "IW-001",
    position: "Product Designer",
    department: "Design",
  },
  "employee2@inwork.demo": {
    name: "James Wilson",
    email: "employee2@inwork.demo",
    role: "employee",
    employeeId: "IW-002",
    position: "Frontend Engineer",
    department: "Engineering",
  },
}
const seedItems: Item[] = [
  {
    id: 1,
    name: 'MacBook Pro 14"',
    code: "AST-210",
    category: "Equipment",
    stock: 8,
    minimum: 3,
    unit: "units",
    location: "IT Store",
  },
  {
    id: 2,
    name: "Ergonomic Chair",
    code: "FUR-091",
    category: "Furniture",
    stock: 12,
    minimum: 5,
    unit: "units",
    location: "Warehouse A",
  },
  {
    id: 3,
    name: "Printer Paper A4",
    code: "SUP-302",
    category: "Supplies",
    stock: 4,
    minimum: 10,
    unit: "reams",
    location: "Supply Room",
  },
]
const performance = [
  { name: "Mon", completed: 7, assigned: 10 },
  { name: "Tue", completed: 10, assigned: 13 },
  { name: "Wed", completed: 8, assigned: 11 },
  { name: "Thu", completed: 12, assigned: 14 },
  { name: "Fri", completed: 11, assigned: 12 },
]

function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function formatStoredDate(
  value: string | undefined,
  locale: string,
  options: Intl.DateTimeFormatOptions,
) {
  if (!value) return value
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(locale, options).format(date)
}

function formatStoredSalary(value: string | undefined, locale: string) {
  if (!value) return value
  const amount = Number(value.replace(/[^\d.]/g, ""))
  return Number.isFinite(amount)
    ? new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(amount)
    : value
}

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function normalizeAttendanceRecords(
  value: unknown,
): {
  records: AttendanceRecord[]
  invalidCount: number
} {
  if (!Array.isArray(value))
    return { records: [], invalidCount: value == null ? 0 : 1 }
  let invalidCount = 0
  const records = value.flatMap((entry, index): AttendanceRecord[] => {
    if (!entry || typeof entry !== "object") {
      invalidCount += 1
      return []
    }
    const candidate = entry as Partial<AttendanceRecord>
    const employeeId = optionalString(candidate.employeeId)
    const date = optionalString(candidate.date)
    if (!employeeId || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      invalidCount += 1
      return []
    }
    return [
      {
        id:
          typeof candidate.id === "number" && Number.isFinite(candidate.id)
            ? candidate.id
            : -(index + 1),
        employeeId,
        date,
        status: optionalString(candidate.status) ?? "",
        checkIn: optionalString(candidate.checkIn),
        checkOut: optionalString(candidate.checkOut),
        checkInPhoto: optionalString(candidate.checkInPhoto),
        checkOutPhoto: optionalString(candidate.checkOutPhoto),
        notes: optionalString(candidate.notes),
        demo: candidate.demo === true,
      },
    ]
  })
  return { records, invalidCount }
}

function demoAttendance(): AttendanceRecord[] {
  const today = new Date()
  const records: AttendanceRecord[] = []
  const people = ["MGR-001", "IW-001", "IW-002"]
  for (let monthOffset = 0; monthOffset < 4; monthOffset++) {
    const monthDate = new Date(
      today.getFullYear(),
      today.getMonth() - monthOffset,
      1,
    )
    const maxDay =
      monthOffset === 0
        ? Math.max(1, today.getDate() - 1)
        : new Date(
            monthDate.getFullYear(),
            monthDate.getMonth() + 1,
            0,
          ).getDate()
    ;[3, 8, 14]
      .filter((day) => day <= maxDay)
      .forEach((day, index) => {
        people.forEach((employeeId, personIndex) => {
          const date = new Date(
            monthDate.getFullYear(),
            monthDate.getMonth(),
            day,
          )
          const status =
            index === 2 && personIndex === 1
              ? "Permission"
              : index === 1 && personIndex === 2
                ? "Late"
                : "Present"
          records.push({
            id: Number(
              `${monthOffset}${day}${personIndex}${Date.now().toString().slice(-4)}`,
            ),
            employeeId,
            date: localDateKey(date),
            checkIn:
              status === "Permission"
                ? undefined
                : status === "Late"
                  ? "09:14"
                  : `08:${String(35 + personIndex * 4).padStart(2, "0")}`,
            checkOut: status === "Permission" ? undefined : "17:12",
            status,
            notes:
              status === "Permission"
                ? "Approved personal leave"
                : "Demo attendance record",
            demo: true,
          })
        })
      })
  }
  return records
}

function getStored<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "") as T
  } catch {
    return fallback
  }
}

export function InWorkApp() {
  const { language, locale, setLanguage, t } = useI18n()
  const [user, setUser] = useState<User | null>(() =>
    getStored("inwork-session", null),
  )
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot">(
    "login",
  )
  const [view, setView] = useState<View>("dashboard")
  const [dark, setDark] = useState(() => getStored("inwork-dark", false))
  const [menu, setMenu] = useState(false)
  const [toast, setToast] = useState("")
  const [employees, setEmployees] = useState(() =>
    getStored("inwork-employees", seedEmployees),
  )
  const [tasks, setTasks] = useState(() => getStored("inwork-tasks", seedTasks))
  const [items, setItems] = useState(() => getStored("inwork-items", seedItems))
  const [modal, setModal] = useState<null | "employee" | "task" | "item">(null)
  const [search, setSearch] = useState("")
  const [checkedIn, setCheckedIn] = useState(() =>
    getStored("inwork-checked-in", false),
  )
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() =>
    getStored("inwork-attendance-v2", demoAttendance()),
  )
  const [reviews, setReviews] = useState<PerformanceReview[]>(() =>
    getStored("inwork-reviews", []),
  )
  const [cameraAction, setCameraAction] =
    useState<null | "checkIn" | "checkOut">(null)

  useEffect(() => {
    localStorage.setItem("inwork-employees", JSON.stringify(employees))
  }, [employees])
  useEffect(() => {
    localStorage.setItem("inwork-tasks", JSON.stringify(tasks))
  }, [tasks])
  useEffect(() => {
    localStorage.setItem("inwork-items", JSON.stringify(items))
  }, [items])
  useEffect(() => {
    localStorage.setItem("inwork-dark", JSON.stringify(dark))
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])
  useEffect(() => {
    localStorage.setItem("inwork-attendance-v2", JSON.stringify(attendance))
  }, [attendance])
  useEffect(() => {
    localStorage.setItem("inwork-reviews", JSON.stringify(reviews))
  }, [reviews])

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(""), 2800)
  }
  const login = (data: LoginData) => {
    const next = demoAccounts[data.email.toLowerCase()]
    if (
      !next ||
      data.password.length < 8 ||
      !data.role ||
      next.role !== data.role
    )
      return false
    localStorage.setItem("inwork-session", JSON.stringify(next))
    setUser(next)
    notify(t("auth.welcomeBack"))
    return true
  }
  const logout = () => {
    localStorage.removeItem("inwork-session")
    setUser(null)
    setView("dashboard")
  }
  const navigate = (next: View) => {
    setView(next)
    setMenu(false)
  }

  if (!user)
    return (
      <Auth
        mode={authMode}
        setMode={setAuthMode}
        login={login}
        notify={notify}
        dark={dark}
      />
    )

  const employeeNav =
    user.role === "employee"
      ? [
          {
            id: "dashboard",
            label: t("nav.myDashboard"),
            icon: LayoutDashboard,
          },
          {
            id: "attendance",
            label: t("nav.myAttendance"),
            icon: CalendarDays,
          },
          { id: "tasks", label: t("nav.myTasks"), icon: ClipboardCheck },
          { id: "inventory", label: t("nav.stockReports"), icon: Package },
        ]
      : [
          { id: "dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
          { id: "employees", label: t("nav.employees"), icon: UsersRound },
          { id: "attendance", label: t("nav.attendance"), icon: CalendarDays },
          { id: "tasks", label: t("nav.tasks"), icon: ClipboardCheck },
          { id: "inventory", label: t("nav.inventory"), icon: Package },
        ]
  const nav = [
    ...employeeNav,
    { id: "notifications", label: t("nav.notifications"), icon: Bell },
    { id: "profile", label: t("nav.profile"), icon: UserRound },
    { id: "settings", label: t("nav.settings"), icon: Settings },
  ] as {
    id: View
    label: string
    icon: typeof LayoutDashboard
  }[]

  return (
    <div className="app-shell">
      <aside className={menu ? "sidebar open" : "sidebar"}>
        <Brand compact />
        <button
          className="mobile-close"
          onClick={() => setMenu(false)}
          aria-label={t("common.closeMenu")}
        >
          <X />
        </button>
        <div className="workspace-pill">
          <span>IW</span>
          <div>
            <strong>InWork Studio</strong>
            <small>
              {user.role === "admin"
                ? t("role.administrator")
                : t("role.employee")}
            </small>
          </div>
        </div>
        <nav>
          {nav.map(({ id, label, icon: Icon }) => (
            <button
              className={view === id ? "nav-item active" : "nav-item"}
              onClick={() => navigate(id)}
              key={id}
            >
              <Icon />
              {label}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="user-chip">
            <span className="avatar">AM</span>
            <div>
              <strong>{user.name}</strong>
              <small>{user.email}</small>
            </div>
          </div>
          <button className="nav-item danger" onClick={logout}>
            <LogOut />
            {t("nav.logout")}
          </button>
        </div>
      </aside>
      {menu && (
        <button
          className="backdrop"
          onClick={() => setMenu(false)}
          aria-label={t("common.closeNavigation")}
        />
      )}
      <main className="main">
        <header className="topbar">
          <button className="menu-button" onClick={() => setMenu(true)}>
            <Menu />
          </button>
          <div className="mobile-brand">
            <Brand compact />
          </div>
          <div className="top-actions">
            <button
              className="icon-button"
              onClick={() => setDark(!dark)}
              aria-label={t("common.toggleTheme")}
            >
              {dark ? <Sun /> : <Moon />}
            </button>
            <button
              className="icon-button notification"
              onClick={() => navigate("notifications")}
              aria-label={t("nav.notifications")}
            >
              <Bell />
              <i />
            </button>
            <button
              className="profile-button"
              onClick={() => navigate("profile")}
            >
              <span className="avatar">AM</span>
              <span>{user.name}</span>
            </button>
          </div>
        </header>
        <section className="content">
          {view === "dashboard" && (
            <Dashboard
              user={user}
              employees={employees}
              tasks={tasks}
              items={items}
              checkedIn={checkedIn}
              setCheckedIn={() =>
                setCameraAction(checkedIn ? "checkOut" : "checkIn")
              }
              navigate={navigate}
            />
          )}
          {view === "employees" && (
            <Employees
              employees={employees}
              search={search}
              setSearch={setSearch}
              open={() => setModal("employee")}
              remove={(id: string) => {
                if (confirm(t("employees.deleteConfirm"))) {
                  setEmployees(employees.filter((e: Employee) => e.id !== id))
                  notify(t("employees.removed"))
                }
              }}
            />
          )}
          {view === "attendance" && (
            <Attendance
              user={user}
              employees={employees}
              checkedIn={checkedIn}
              attendance={attendance}
              action={() => setCameraAction(checkedIn ? "checkOut" : "checkIn")}
              lang={language}
            />
          )}
          {view === "tasks" && (
            <Tasks
              user={user}
              employees={employees}
              tasks={tasks}
              setTasks={setTasks}
              reviews={reviews}
              setReviews={setReviews}
              attendance={attendance}
              open={() => setModal("task")}
              notify={notify}
            />
          )}
          {view === "inventory" && (
            <Inventory
              user={user}
              items={items}
              setItems={setItems}
              open={() => setModal("item")}
              notify={notify}
            />
          )}
          {view === "notifications" && <Notifications />}
          {view === "profile" && (
            <Profile
              user={user}
              setUser={setUser}
              employees={employees}
              setEmployees={setEmployees}
              notify={notify}
            />
          )}
          {view === "settings" && (
            <SettingsPage
              dark={dark}
              setDark={setDark}
              lang={language}
              setLang={setLanguage}
            />
          )}
        </section>
      </main>
      {modal && (
        <AddModal
          type={modal}
          employees={employees}
          close={() => setModal(null)}
          save={(data: Employee | Task | Item) => {
            if (modal === "employee")
              setEmployees([...employees, data as Employee])
            if (modal === "task") setTasks([...tasks, data as Task])
            if (modal === "item") setItems([...items, data as Item])
            setModal(null)
            notify(t("modal.added", { type: modal }))
          }}
        />
      )}
      {cameraAction && (
        <CameraAttendance
          action={cameraAction}
          close={() => setCameraAction(null)}
          confirm={(photo) => {
            const now = new Date()
            const date = now.toISOString().slice(0, 10)
            const time = now.toLocaleTimeString(locale, {
              hour: "2-digit",
              minute: "2-digit",
            })
            if (cameraAction === "checkIn") {
              const record: AttendanceRecord = {
                id: Date.now(),
                employeeId: user.employeeId,
                date,
                checkIn: time,
                checkInPhoto: photo,
                status: now.getHours() >= 9 ? "Late" : "Present",
              }
              setAttendance([
                ...attendance.filter(
                  (x) => !(x.employeeId === user.employeeId && x.date === date),
                ),
                record,
              ])
              setCheckedIn(true)
              localStorage.setItem("inwork-checked-in", "true")
              notify(t("attendance.inSuccess"))
            } else {
              const existing = attendance.find(
                (x) => x.employeeId === user.employeeId && x.date === date,
              )
              if (!existing) {
                notify(t("attendance.requiresCheckIn"))
                return
              }
              setAttendance(
                attendance.map((x) =>
                  x.id === existing.id
                    ? { ...x, checkOut: time, checkOutPhoto: photo }
                    : x,
                ),
              )
              setCheckedIn(false)
              localStorage.setItem("inwork-checked-in", "false")
              notify(t("attendance.outSuccess"))
            }
            setCameraAction(null)
          }}
        />
      )}
      {toast && (
        <div className="toast">
          <Check />
          {toast}
        </div>
      )}
    </div>
  )
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "brand compact" : "brand"}>
      <span className="logo-mark">
        <i />
        <i />
        <i />
      </span>
      <div>
        <b>InWork</b>
        {!compact && <small>Manage Work. Empower People.</small>}
      </div>
    </div>
  )
}

function Auth({
  mode,
  setMode,
  login,
  notify,
  dark,
}: {
  mode: "login" | "register" | "forgot"
  setMode: (m: "login" | "register" | "forgot") => void
  login: (d: LoginData) => boolean
  notify: (s: string) => void
  dark: boolean
}) {
  const { t } = useI18n()
  const [show, setShow] = useState(false)
  const [error, setError] = useState("")
  const [role, setRole] = useState<Role>("admin")
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    if (mode === "forgot") {
      notify(t("auth.resetSent"))
      setMode("login")
      return
    }
    const password = String(fd.get("password") || "")
    if (mode === "register") {
      if (password !== fd.get("confirm")) {
        setError(t("auth.passwordMismatch"))
        return
      }
      notify(t("auth.created"))
      setMode("login")
      return
    }
    if (!login({ email: String(fd.get("email")), password, role }))
      setError(t("auth.invalid"))
  }
  return (
    <div className={dark ? "auth-page dark" : "auth-page"}>
      <div className="auth-art">
        <Brand />
        <div className="art-copy">
          <span className="eyebrow">{t("auth.peopleSystem")}</span>
          <h1>{t("auth.heroTitle")}</h1>
          <p>{t("auth.heroDescription")}</p>
        </div>
        <div className="floating-card">
          <span className="avatar mint">JW</span>
          <div>
            <b>{t("auth.checkedIn")}</b>
            <small>{t("auth.onTime")}</small>
          </div>
          <span className="success-dot">
            <Check />
          </span>
        </div>
        <p className="demo-note">{t("auth.demoNote")}</p>
      </div>
      <div className="auth-panel">
        <div className="auth-mobile-brand">
          <Brand />
        </div>
        <div className="auth-box">
          <span className="eyebrow">
            {mode === "register"
              ? t("auth.createWorkspace")
              : mode === "forgot"
                ? t("auth.recovery")
                : t("auth.welcome")}
          </span>
          <h2>
            {mode === "register"
              ? t("auth.createAccount")
              : mode === "forgot"
                ? t("auth.resetPassword")
                : t("auth.signInTo")}
          </h2>
          <p>
            {mode === "login"
              ? t("auth.loginHelp")
              : mode === "register"
                ? t("auth.registerHelp")
                : t("auth.resetHelp")}
          </p>
          <form onSubmit={submit}>
            {mode === "login" && (
              <div className="role-select">
                <button
                  type="button"
                  className={role === "admin" ? "active" : ""}
                  onClick={() => setRole("admin")}
                >
                  <UsersRound />
                  {t("auth.loginManager")}
                </button>
                <button
                  type="button"
                  className={role === "employee" ? "active" : ""}
                  onClick={() => setRole("employee")}
                >
                  <UserRound />
                  {t("auth.loginEmployee")}
                </button>
              </div>
            )}
            {mode === "register" && (
              <Field
                label={t("auth.fullName")}
                name="name"
                placeholder={t("auth.yourFullName")}
              />
            )}
            <Field
              label={t("auth.emailAddress")}
              name="email"
              type="email"
              placeholder="you@company.com"
            />
            {mode !== "forgot" && (
              <label className="field">
                <span>{t("auth.password")}</span>
                <div className="password-field">
                  <input
                    name="password"
                    type={show ? "text" : "password"}
                    minLength={8}
                    placeholder={t("auth.passwordHint")}
                    required
                  />
                  <button type="button" onClick={() => setShow(!show)}>
                    {show ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </label>
            )}
            {mode === "register" && (
              <Field
                label={t("auth.confirmPassword")}
                name="confirm"
                type="password"
                placeholder={t("auth.repeatPassword")}
              />
            )}
            {error && <div className="form-error">{error}</div>}
            {mode === "login" && (
              <div className="form-row">
                <label className="check">
                  <input type="checkbox" /> {t("auth.remember")}
                </label>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => setMode("forgot")}
                >
                  {t("auth.forgot")}
                </button>
              </div>
            )}
            <button className="primary-button" type="submit">
              {mode === "register"
                ? t("auth.create")
                : mode === "forgot"
                  ? t("auth.sendReset")
                  : t("auth.signIn")}
              <ChevronRight />
            </button>
          </form>
          <p className="demo-accounts">
            {t("auth.demoPassword")} <b>inworkdemo</b>
            <br />
            {t("auth.manager")} manager@inwork.demo
            <br />
            {t("auth.employees")} employee1@inwork.demo · employee2@inwork.demo
          </p>
          <p className="switch-auth">
            {mode === "login" ? t("auth.new") : t("auth.existing")}{" "}
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
            >
              {mode === "login" ? t("auth.create") : t("auth.back")}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
}: {
  label: string
  name: string
  type?: string
  placeholder: string
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input name={name} type={type} placeholder={placeholder} required />
    </label>
  )
}

function PageHead({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="page-head">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  )
}

function Dashboard({
  user,
  employees,
  tasks,
  items,
  checkedIn,
  setCheckedIn,
  navigate,
}: any) {
  const { locale, status, t } = useI18n()
  const localizedPerformance = performance.map((item, index) => ({
    ...item,
    name: new Intl.DateTimeFormat(locale, { weekday: "short" }).format(
      new Date(2024, 0, index + 1),
    ),
  }))
  const cards =
    user.role === "admin"
      ? [
          {
            label: t("dashboard.totalEmployees"),
            value: employees.length,
            icon: UsersRound,
            color: "blue",
            to: "employees",
          },
          {
            label: t("dashboard.presentToday"),
            value: employees.length - 1,
            icon: ClipboardCheck,
            color: "green",
            to: "attendance",
          },
          {
            label: t("dashboard.openTasks"),
            value: tasks.filter((x: Task) => x.status !== "Completed").length,
            icon: BriefcaseBusiness,
            color: "orange",
            to: "tasks",
          },
          {
            label: t("dashboard.lowStockItems"),
            value: items.filter((x: Item) => x.stock <= x.minimum).length,
            icon: Archive,
            color: "purple",
            to: "inventory",
          },
        ]
      : [
          {
            label: t("dashboard.monthAttendance"),
            value: "96%",
            icon: CalendarDays,
            color: "blue",
          },
          {
            label: t("dashboard.tasksCompleted"),
            value: tasks.filter((x: Task) => x.status === "Completed").length,
            icon: ClipboardCheck,
            color: "green",
          },
          {
            label: t("dashboard.tasksProgress"),
            value: tasks.filter((x: Task) => x.status === "In Progress").length,
            icon: Clock3,
            color: "orange",
          },
        ]
  return (
    <>
      <PageHead
        eyebrow={new Intl.DateTimeFormat(locale, {
          weekday: "long",
          month: "long",
          day: "numeric",
        })
          .format(new Date())
          .toUpperCase()}
        title={`${t("dashboard.greeting")}, ${user.name.split(" ")[0]}`}
        description={t("dashboard.overview")}
        action={<span className="demo-badge">{t("dashboard.demo")}</span>}
      />
      <div className="stats-grid">
        {cards.map((card: any) => (
          <button
            className="stat-card"
            key={card.label}
            onClick={() => card.to && navigate(card.to)}
          >
            <span className={`stat-icon ${card.color}`}>
              <card.icon />
            </span>
            <div>
              <small>{card.label}</small>
              <strong>{card.value}</strong>
            </div>
            <ChevronRight />
          </button>
        ))}
      </div>
      <div className="dashboard-grid">
        <article className="panel chart-panel">
          <div className="panel-head">
            <div>
              <h2>{t("dashboard.taskPerformance")}</h2>
              <p>{t("dashboard.taskPerformanceHelp")}</p>
            </div>
            <span className="trend">+18.2%</span>
          </div>
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={localizedPerformance}>
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="var(--border)"
                />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "var(--soft)" }} />
                <Bar dataKey="assigned" fill="#D9DEFF" radius={[6, 6, 0, 0]} />
                <Bar dataKey="completed" fill="#3038D9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
        <article className="panel attendance-card">
          <div className="panel-head">
            <div>
              <h2>{t("dashboard.todayAttendance")}</h2>
              <p>{t("dashboard.workday")}</p>
            </div>
            <Clock3 />
          </div>
          <div className="time-display">
            {new Intl.DateTimeFormat(locale, {
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date())}
            <small>{t("dashboard.localTime")}</small>
          </div>
          <div className="attendance-times">
            <div>
              <small>{t("attendance.checkIn")}</small>
              <b>{checkedIn ? "08:42 AM" : "—"}</b>
            </div>
            <div>
              <small>{t("attendance.checkOut")}</small>
              <b>{checkedIn ? t("dashboard.notYet") : "—"}</b>
            </div>
          </div>
          <button
            className={checkedIn ? "secondary-button" : "primary-button"}
            onClick={() => setCheckedIn(!checkedIn)}
          >
            {checkedIn ? t("attendance.checkOut") : t("attendance.checkInNow")}
          </button>
        </article>
        <article className="panel recent">
          <div className="panel-head">
            <div>
              <h2>{t("dashboard.recent")}</h2>
              <p>{t("dashboard.latest")}</p>
            </div>
            <button
              onClick={() => navigate("notifications")}
              className="text-button"
            >
              {t("dashboard.viewAll")}
            </button>
          </div>
          {[
            t("dashboard.activity1"),
            t("dashboard.activity2"),
            t("dashboard.activity3"),
          ].map((x, i) => (
            <div className="activity" key={x}>
              <span className={`activity-icon a${i}`}>
                <Check />
              </span>
              <div>
                <b>{x}</b>
                <small>
                  {t("common.hoursAgo", { count: i + 1, suffix: i ? "s" : "" })}
                </small>
              </div>
            </div>
          ))}
        </article>
        <article className="panel tasks-preview">
          <div className="panel-head">
            <div>
              <h2>{t("dashboard.priorityTasks")}</h2>
              <p>{t("dashboard.needsAttention")}</p>
            </div>
            <button onClick={() => navigate("tasks")} className="text-button">
              {t("dashboard.viewTasks")}
            </button>
          </div>
          {tasks.slice(0, 3).map((task: Task) => (
            <div className="mini-task" key={task.id}>
              <span className={`priority ${task.priority.toLowerCase()}`}>
                {status(task.priority)}
              </span>
              <div>
                <b>{task.title}</b>
                <small>
                  {task.assignee} ·{" "}
                  {t("dashboard.due", {
                    date:
                      formatStoredDate(task.due, locale, {
                        day: "numeric",
                        month: "short",
                      }) || task.due,
                  })}
                </small>
              </div>
              <strong>{task.progress}%</strong>
            </div>
          ))}
        </article>
      </div>
    </>
  )
}

function Employees({ employees, search, setSearch, open, remove }: any) {
  const { status, t } = useI18n()
  const filtered = employees.filter((e: Employee) =>
    `${e.name} ${e.department} ${e.position}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  )
  const [selected, setSelected] = useState<Employee | null>(null)
  return (
    <>
      <PageHead
        eyebrow={t("employees.eyebrow")}
        title={t("employees.title")}
        description={t("employees.description")}
        action={
          <button className="primary-button fit" onClick={open}>
            <Plus />
            {t("employees.add")}
          </button>
        }
      />
      <Toolbar
        search={search}
        setSearch={setSearch}
        placeholder={t("employees.search")}
      />
      <div className="people-grid">
        {filtered.map((e: Employee, i: number) => (
          <article className="person-card" key={e.id}>
            <div className={`person-cover c${i % 4}`} />
            <span className="person-avatar">{e.initials}</span>
            <span className="status-badge">{status(e.status)}</span>
            <h3>{e.name}</h3>
            <p>{e.position}</p>
            <dl>
              <div>
                <dt>{t("employees.id")}</dt>
                <dd>{e.id}</dd>
              </div>
              <div>
                <dt>{t("employees.department")}</dt>
                <dd>{e.department}</dd>
              </div>
              <div>
                <dt>{t("employees.email")}</dt>
                <dd>{e.email}</dd>
              </div>
            </dl>
            <div className="card-actions">
              <button
                className="secondary-button"
                onClick={() => setSelected(e)}
              >
                {t("employees.viewProfile")}
              </button>
              <button
                className="icon-button danger"
                onClick={() => remove(e.id)}
              >
                <X />
              </button>
            </div>
          </article>
        ))}
      </div>
      {selected && (
        <EmployeeDetail employee={selected} close={() => setSelected(null)} />
      )}
    </>
  )
}

function Toolbar({ search, setSearch, placeholder }: any) {
  const { t } = useI18n()
  return (
    <div className="toolbar">
      <label className="search">
        <Search />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
        />
      </label>
      <button className="secondary-button">
        {t("employees.allDepartments")}
      </button>
      <button className="secondary-button">{t("employees.active")}</button>
    </div>
  )
}

function Attendance({
  user,
  employees,
  checkedIn,
  attendance,
  action,
  lang,
}: any) {
  const { locale, status: translateStatus, t } = useI18n()
  const today = useMemo(() => new Date(), [])
  const [monthOffset, setMonthOffset] = useState(0)
  const [selectedDate, setSelectedDate] = useState(() => localDateKey(today))
  const viewedMonth = new Date(
    today.getFullYear(),
    today.getMonth() + monthOffset,
    1,
  )
  const year = viewedMonth.getFullYear()
  const month = viewedMonth.getMonth()
  const dayCount = new Date(year, month + 1, 0).getDate()
  const leadingDays = (new Date(year, month, 1).getDay() + 6) % 7
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`
  const normalized = useMemo(
    () => normalizeAttendanceRecords(attendance),
    [attendance],
  )
  const visibleRecords = normalized.records.filter(
    (record: AttendanceRecord) =>
      record.date.startsWith(monthKey) &&
      (user.role === "admin" || record.employeeId === user.employeeId),
  )
  const dailyRecords = visibleRecords.filter(
    (record: AttendanceRecord) => record.date === selectedDate,
  )
  const ownRecord = dailyRecords.find(
    (record: AttendanceRecord) => record.employeeId === user.employeeId,
  )
  const selectDay = (day: number) =>
    setSelectedDate(localDateKey(new Date(year, month, day)))
  const changeMonth = (next: number) => {
    if (next > 0 || next < -3) return
    setMonthOffset(next)
    const target = new Date(
      today.getFullYear(),
      today.getMonth() + next,
      next === 0 ? today.getDate() : 1,
    )
    setSelectedDate(localDateKey(target))
  }
  const employeeName = (id: string) =>
    id === "MGR-001"
      ? "Alex Morgan"
      : employees.find((employee: Employee) => employee.id === id)?.name || id
  const employeeDepartment = (id: string) =>
    id === "MGR-001"
      ? "People Operations"
      : employees.find((employee: Employee) => employee.id === id)
          ?.department || "—"
  const monthLabel = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(viewedMonth)
  const selectedLabel = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${selectedDate}T12:00:00`))
  return (
    <>
      <PageHead
        eyebrow={monthLabel.toUpperCase()}
        title={
          user.role === "admin" ? t("attendance.history") : t("attendance.mine")
        }
        description={t("attendance.description")}
        action={
          <button
            className={
              checkedIn ? "secondary-button fit" : "primary-button fit"
            }
            onClick={action}
          >
            <Clock3 />
            {checkedIn ? t("attendance.cameraOut") : t("attendance.cameraIn")}
          </button>
        }
      />
      {normalized.invalidCount > 0 && (
        <div className="attendance-warning">
          <b>{t("attendance.warning")}</b>
          <span>
            {t("attendance.warningDetail", {
              count: normalized.invalidCount,
              suffix: normalized.invalidCount === 1 ? "" : "s",
            })}
          </span>
        </div>
      )}
      <div className="attendance-layout">
        <article className="panel calendar">
          <div className="calendar-navigation">
            <button
              className="icon-button"
              disabled={monthOffset <= -3}
              onClick={() => changeMonth(monthOffset - 1)}
              aria-label={t("attendance.previousMonth")}
            >
              ‹
            </button>
            <div>
              <h2>{monthLabel}</h2>
              <p>{t("attendance.historyRange")}</p>
            </div>
            <button
              className="icon-button"
              disabled={monthOffset >= 0}
              onClick={() => changeMonth(monthOffset + 1)}
              aria-label={t("attendance.nextMonth")}
            >
              ›
            </button>
          </div>
          <div className="week">
            {(lang === "id"
              ? ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]
              : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
            ).map((x) => (
              <b key={x}>{x}</b>
            ))}
          </div>
          <div className="days">
            {Array.from({ length: leadingDays }).map((_, i) => (
              <span className="day-spacer" key={`blank-${i}`} />
            ))}
            {Array.from({ length: dayCount }, (_, i) => i + 1).map((day) => {
              const key = localDateKey(new Date(year, month, day))
              const records = visibleRecords.filter(
                (record: AttendanceRecord) => record.date === key,
              )
              const isToday = key === localDateKey(today)
              const selected = key === selectedDate
              const rawStatus =
                user.role === "employee"
                  ? records[0]?.status
                  : records.some(
                        (record: AttendanceRecord) => record.status === "Late",
                      )
                    ? "Late"
                    : records.length
                      ? "Recorded"
                      : ""
              const status =
                typeof rawStatus === "string" ? rawStatus.trim() : ""
              const statusClass = status
                ? status.toLowerCase().replace(/[^a-z0-9_-]/g, "-")
                : ""
              return (
                <button
                  onClick={() => selectDay(day)}
                  className={`day ${isToday ? "today " : ""}${
                    selected ? "selected " : ""
                  }${statusClass}`}
                  key={day}
                >
                  <span>{day}</span>
                  {records.length > 0 && (
                    <small>
                      {user.role === "admin"
                        ? t("attendance.records", { count: records.length })
                        : status
                          ? translateStatus(status)
                          : t("attendance.statusUnavailable")}
                    </small>
                  )}
                </button>
              )
            })}
          </div>
          <div className="demo-legend">
            <i /> {t("attendance.legend")}
          </div>
        </article>
        <article className="panel daily-summary">
          <span className="eyebrow">{t("attendance.selectedDate")}</span>
          <h2>{selectedLabel}</h2>
          {user.role === "employee" ? (
            ownRecord ? (
              <>
                <span className="demo-record-badge">
                  {ownRecord.demo
                    ? t("attendance.demoRecord")
                    : t("attendance.recorded")}
                </span>
                <div className="detail-grid attendance-detail">
                  <div>
                    <small>{t("attendance.status")}</small>
                    <b>
                      {ownRecord.status
                        ? translateStatus(ownRecord.status)
                        : t("attendance.statusUnavailable")}
                    </b>
                  </div>
                  <div>
                    <small>{t("attendance.checkIn")}</small>
                    <b>{ownRecord.checkIn || "—"}</b>
                  </div>
                  <div>
                    <small>{t("attendance.checkOut")}</small>
                    <b>{ownRecord.checkOut || t("common.incomplete")}</b>
                  </div>
                  <div>
                    <small>{t("attendance.photo")}</small>
                    <b>
                      {ownRecord.checkInPhoto || ownRecord.checkOutPhoto
                        ? t("common.available")
                        : t("common.notAvailable")}
                    </b>
                  </div>
                </div>
                {ownRecord.notes && (
                  <p className="attendance-notes">{ownRecord.notes}</p>
                )}
                {ownRecord.checkInPhoto && (
                  <img
                    className="evidence-thumb"
                    src={ownRecord.checkInPhoto}
                    alt={t("attendance.capturedAlt")}
                  />
                )}
              </>
            ) : (
              <div className="empty-state">
                <CalendarDays />
                <h3>{t("attendance.noRecord")}</h3>
                <p>{t("attendance.noRecordDetail")}</p>
              </div>
            )
          ) : (
            <ManagerDailySummary
              records={dailyRecords}
              employees={employees}
              employeeName={employeeName}
              employeeDepartment={employeeDepartment}
            />
          )}
        </article>
      </div>
    </>
  )
}

function ManagerDailySummary({
  records,
  employees,
  employeeName,
  employeeDepartment,
}: any) {
  const { status, t } = useI18n()
  const expected = employees.length + 1
  return (
    <>
      {records.length ? (
        <>
          <div className="daily-metrics">
            <div>
              <small>{t("attendance.expected")}</small>
              <b>{expected}</b>
            </div>
            <div>
              <small>{t("attendance.checkedIn")}</small>
              <b>{records.filter((x: AttendanceRecord) => x.checkIn).length}</b>
            </div>
            <div>
              <small>{t("attendance.checkedOut")}</small>
              <b>
                {records.filter((x: AttendanceRecord) => x.checkOut).length}
              </b>
            </div>
            <div>
              <small>{t("attendance.late")}</small>
              <b>
                {
                  records.filter((x: AttendanceRecord) => x.status === "Late")
                    .length
                }
              </b>
            </div>
            <div>
              <small>{t("attendance.permission")}</small>
              <b>
                {
                  records.filter(
                    (x: AttendanceRecord) => x.status === "Permission",
                  ).length
                }
              </b>
            </div>
            <div>
              <small>{t("common.incomplete")}</small>
              <b>
                {
                  records.filter(
                    (x: AttendanceRecord) => x.checkIn && !x.checkOut,
                  ).length
                }
              </b>
            </div>
          </div>
          <div className="attendance-table-wrap">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>{t("attendance.employee")}</th>
                  <th>ID</th>
                  <th>{t("employees.department")}</th>
                  <th>{t("attendance.checkIn")}</th>
                  <th>{t("attendance.checkOut")}</th>
                  <th>{t("attendance.status")}</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record: AttendanceRecord) => (
                  <tr key={record.id}>
                    <td>
                      {employeeName(record.employeeId)}
                      {record.demo && <small>{t("common.demo")}</small>}
                    </td>
                    <td>{record.employeeId}</td>
                    <td>{employeeDepartment(record.employeeId)}</td>
                    <td>{record.checkIn || "—"}</td>
                    <td>{record.checkOut || "—"}</td>
                    <td>
                      <span className="status-badge">
                        {record.status
                          ? status(record.status)
                          : t("attendance.statusUnavailable")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <CalendarDays />
          <h3>{t("attendance.noRecorded")}</h3>
          <p>{t("attendance.missing")}</p>
        </div>
      )}
    </>
  )
}

function Tasks({
  user,
  employees,
  tasks,
  setTasks,
  reviews,
  setReviews,
  attendance,
  open,
  notify,
}: any) {
  const { locale, status: translateStatus, t } = useI18n()
  const [reviewOpen, setReviewOpen] = useState(false)
  const update = (task: Task) => {
    const status = task.status === "To Do" ? "In Progress" : "Completed"
    setTasks(
      tasks.map((x: Task) =>
        x.id === task.id
          ? { ...x, status, progress: status === "Completed" ? 100 : 50 }
          : x,
      ),
    )
    notify(t("tasks.updated"))
  }
  const claim = (task: Task) => {
    if (task.requiredPosition !== user.position)
      return notify(
        t("tasks.onlyPosition", { position: task.requiredPosition || "" }),
      )
    if (task.claimedBy?.includes(user.employeeId))
      return notify(t("tasks.alreadyClaimed"))
    if ((task.claimedBy?.length || 0) >= (task.slots || 1))
      return notify(t("tasks.noSlot"))
    setTasks(
      tasks.map((x: Task) =>
        x.id === task.id
          ? {
              ...x,
              claimedBy: [...(x.claimedBy || []), user.employeeId],
              assignee: user.name,
              status: "To Do",
            }
          : x,
      ),
    )
    notify(t("tasks.claimedSuccess"))
  }
  const available = tasks.filter(
    (x: Task) =>
      x.status === "Available" &&
      x.requiredPosition === user.position &&
      !x.claimedBy?.includes(user.employeeId),
  )
  const visible =
    user.role === "employee"
      ? tasks.filter((x: Task) => x.claimedBy?.includes(user.employeeId))
      : tasks
  return (
    <>
      <PageHead
        eyebrow={t("tasks.eyebrow")}
        title={user.role === "admin" ? t("tasks.title") : t("tasks.mine")}
        description={t("tasks.description")}
        action={
          <div className="head-actions">
            <button
              className="secondary-button fit"
              onClick={() => setReviewOpen(true)}
            >
              {user.role === "admin"
                ? t("tasks.createReview")
                : t("tasks.performanceNotes")}
            </button>
            {user.role === "admin" && (
              <button className="primary-button fit" onClick={open}>
                <Plus />
                {t("tasks.publish")}
              </button>
            )}
          </div>
        }
      />
      {user.role === "employee" && (
        <>
          <div className="section-title">
            <h2>{t("tasks.available")}</h2>
            <p>{t("tasks.positionMatch", { position: user.position })}</p>
          </div>
          <div className="available-grid">
            {available.length ? (
              available.map((task: Task) => (
                <article className="task-card" key={task.id}>
                  <span className={`priority ${task.priority.toLowerCase()}`}>
                    {translateStatus(task.priority)}
                  </span>
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>
                  <dl className="task-facts">
                    <div>
                      <dt>{t("tasks.requiredPosition")}</dt>
                      <dd>{task.requiredPosition}</dd>
                    </div>
                    <div>
                      <dt>{t("tasks.availableSlots")}</dt>
                      <dd>
                        {(task.slots || 1) - (task.claimedBy?.length || 0)}
                      </dd>
                    </div>
                    <div>
                      <dt>{t("tasks.deadline")}</dt>
                      <dd>
                        {formatStoredDate(task.due, locale, {
                          day: "numeric",
                          month: "short",
                        })}
                      </dd>
                    </div>
                  </dl>
                  <button
                    className="primary-button full"
                    onClick={() => claim(task)}
                  >
                    {t("tasks.claim")}
                  </button>
                </article>
              ))
            ) : (
              <div className="empty-inline">{t("tasks.noneEligible")}</div>
            )}
          </div>
          <div className="section-title">
            <h2>{t("tasks.claimed")}</h2>
            <p>{t("tasks.assigned")}</p>
          </div>
        </>
      )}
      <div className="task-board">
        {["To Do", "In Progress", "Completed"].map((status) => (
          <section className="task-column" key={status}>
            <div className="column-title">
              <span>{translateStatus(status)}</span>
              <b>{visible.filter((x: Task) => x.status === status).length}</b>
            </div>
            {visible
              .filter((x: Task) => x.status === status)
              .map((task: Task) => (
                <article className="task-card" key={task.id}>
                  <span className={`priority ${task.priority.toLowerCase()}`}>
                    {translateStatus(task.priority)}
                  </span>
                  <h3>{task.title}</h3>
                  <p>{task.description || t("tasks.defaultDescription")}</p>
                  <div className="progress-label">
                    <span>{t("tasks.progress")}</span>
                    <b>{task.progress}%</b>
                  </div>
                  <div className="progress">
                    <i style={{ width: `${task.progress}%` }} />
                  </div>
                  <div className="task-meta">
                    <span className="avatar small">
                      {task.assignee
                        ? task.assignee
                            .split(" ")
                            .map((x) => x[0])
                            .join("")
                        : "—"}
                    </span>
                    <span>
                      <CalendarDays />
                      {formatStoredDate(task.due, locale, {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                  {status !== "Completed" && user.role === "employee" && (
                    <button
                      className="secondary-button full"
                      onClick={() => update(task)}
                    >
                      {t("tasks.moveForward")}
                    </button>
                  )}
                </article>
              ))}
          </section>
        ))}
      </div>
      {reviewOpen && (
        <PerformanceReviewModal
          user={user}
          employees={employees}
          reviews={reviews}
          setReviews={setReviews}
          tasks={tasks}
          attendance={attendance}
          close={() => setReviewOpen(false)}
          notify={notify}
        />
      )}
    </>
  )
}

function PerformanceReviewModal({
  user,
  employees,
  reviews,
  setReviews,
  tasks,
  attendance,
  close,
  notify,
}: any) {
  const { locale, t } = useI18n()
  const ownPublished = reviews
    .filter(
      (review: PerformanceReview) =>
        review.employeeId === user.employeeId && review.status === "Published",
    )
    .sort((a: PerformanceReview, b: PerformanceReview) =>
      b.month.localeCompare(a.month),
    )
  const [selectedReview, setSelectedReview] = useState(ownPublished[0]?.id || 0)
  const [employeeId, setEmployeeId] = useState(employees[0]?.id || "")
  const [month, setMonth] = useState(localDateKey(new Date()).slice(0, 7))
  const existing = reviews.find(
    (review: PerformanceReview) =>
      review.employeeId === employeeId && review.month === month,
  )
  const employeeTasks = tasks.filter((task: Task) =>
    task.claimedBy?.includes(employeeId),
  )
  const periodAttendance = normalizeAttendanceRecords(
    attendance,
  ).records.filter(
    (record: AttendanceRecord) =>
      record.employeeId === employeeId && record.date.startsWith(month),
  )
  if (user.role === "employee") {
    const review = ownPublished.find(
      (item: PerformanceReview) => item.id === selectedReview,
    )
    return (
      <div className="modal-wrap">
        <div className="modal review-modal">
          <div className="modal-head">
            <div>
              <span className="eyebrow">{t("review.monthlyNotes")}</span>
              <h2>{t("review.managerFeedback")}</h2>
            </div>
            <button className="icon-button" onClick={close}>
              <X />
            </button>
          </div>
          {ownPublished.length ? (
            <>
              <label className="field">
                <span>{t("review.period")}</span>
                <select
                  value={selectedReview}
                  onChange={(e) => setSelectedReview(Number(e.target.value))}
                >
                  {ownPublished.map((item: PerformanceReview) => (
                    <option value={item.id} key={item.id}>
                      {new Intl.DateTimeFormat(locale, {
                        month: "long",
                        year: "numeric",
                      }).format(new Date(`${item.month}-01T12:00:00`))}
                    </option>
                  ))}
                </select>
              </label>
              {review && (
                <div className="review-sections">
                  <ReviewBlock
                    title={t("review.summary")}
                    value={review.notes}
                  />
                  <ReviewBlock
                    title={t("review.achievements")}
                    value={review.achievements}
                  />
                  <ReviewBlock
                    title={t("review.improvements")}
                    value={review.improvements}
                  />
                  <ReviewBlock
                    title={t("review.quality")}
                    value={review.quality}
                  />
                  <ReviewBlock
                    title={t("review.taskCompletion")}
                    value={review.taskSummary}
                  />
                  <ReviewBlock
                    title={t("review.attendance")}
                    value={review.attendanceSummary}
                  />
                  <ReviewBlock
                    title={t("review.recommendations")}
                    value={review.recommendations}
                  />
                  <p className="review-date">
                    {t("review.published")} ·{" "}
                    {new Date(review.updatedAt).toLocaleDateString(locale)}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <ClipboardCheck />
              <h3>{t("review.none")}</h3>
              <p>{t("review.noneDetail")}</p>
            </div>
          )}
        </div>
      </div>
    )
  }
  const save = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const now = new Date().toISOString()
    const next: PerformanceReview = {
      id: existing?.id || Date.now(),
      employeeId,
      month,
      status: String(data.get("status")) as "Draft" | "Published",
      taskSummary: String(data.get("taskSummary")),
      quality: String(data.get("quality")),
      achievements: String(data.get("achievements")),
      improvements: String(data.get("improvements")),
      attendanceSummary: String(data.get("attendanceSummary")),
      notes: String(data.get("notes")),
      recommendations: String(data.get("recommendations")),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    }
    setReviews(
      existing
        ? reviews.map((review: PerformanceReview) =>
            review.id === existing.id ? next : review,
          )
        : [...reviews, next],
    )
    notify(
      next.status === "Published"
        ? t("review.publishedSuccess")
        : t("review.draftSuccess"),
    )
    close()
  }
  return (
    <div className="modal-wrap">
      <div className="modal review-modal">
        <div className="modal-head">
          <div>
            <span className="eyebrow">{t("review.monthly")}</span>
            <h2>{existing ? t("review.edit") : t("review.create")}</h2>
          </div>
          <button className="icon-button" onClick={close}>
            <X />
          </button>
        </div>
        <form key={`${employeeId}-${month}`} onSubmit={save}>
          <div className="form-grid">
            <label className="field">
              <span>{t("review.employee")}</span>
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              >
                {employees.map((employee: Employee) => (
                  <option value={employee.id} key={employee.id}>
                    {employee.name} · {employee.id}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>{t("review.month")}</span>
              <input
                type="month"
                value={month}
                max={localDateKey(new Date()).slice(0, 7)}
                onChange={(e) => setMonth(e.target.value)}
              />
            </label>
          </div>
          <div className="context-panel">
            <b>{t("review.context")}</b>
            <span>
              {
                employeeTasks.filter(
                  (task: Task) => task.status === "Completed",
                ).length
              }{" "}
              {t("tasks.completed").toLowerCase()}
            </span>
            <span>
              {
                employeeTasks.filter(
                  (task: Task) => task.status === "In Progress",
                ).length
              }{" "}
              {t("tasks.inProgress").toLowerCase()}
            </span>
            <span>
              {t("review.attendanceCount", { count: periodAttendance.length })}
            </span>
            <span>
              {
                periodAttendance.filter(
                  (record: AttendanceRecord) => record.status === "Late",
                ).length
              }{" "}
              {t("attendance.late").toLowerCase()}
            </span>
          </div>
          <ReviewField
            label={t("review.taskSummary")}
            name="taskSummary"
            value={
              existing?.taskSummary ||
              t("review.taskContext", {
                completed: employeeTasks.filter(
                  (task: Task) => task.status === "Completed",
                ).length,
                open: employeeTasks.filter(
                  (task: Task) => task.status !== "Completed",
                ).length,
              })
            }
          />
          <ReviewField
            label={t("review.qualityAssessment")}
            name="quality"
            value={existing?.quality}
          />
          <ReviewField
            label={t("review.achievements")}
            name="achievements"
            value={existing?.achievements}
          />
          <ReviewField
            label={t("review.improvements")}
            name="improvements"
            value={existing?.improvements}
          />
          <ReviewField
            label={t("review.attendance")}
            name="attendanceSummary"
            value={
              existing?.attendanceSummary ||
              t("review.attendanceContext", {
                days: periodAttendance.length,
                late: periodAttendance.filter(
                  (record: AttendanceRecord) => record.status === "Late",
                ).length,
                permission: periodAttendance.filter(
                  (record: AttendanceRecord) => record.status === "Permission",
                ).length,
              })
            }
          />
          <ReviewField
            label={t("review.managerNotes")}
            name="notes"
            value={existing?.notes}
          />
          <ReviewField
            label={t("review.recommendations")}
            name="recommendations"
            value={existing?.recommendations}
          />
          <label className="field">
            <span>{t("review.status")}</span>
            <select name="status" defaultValue={existing?.status || "Draft"}>
              <option value="Draft">{t("review.draft")}</option>
              <option value="Published">{t("review.published")}</option>
            </select>
          </label>
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={close}>
              {t("common.cancel")}
            </button>
            <button className="primary-button">{t("review.save")}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ReviewField({
  label,
  name,
  value = "",
}: {
  label: string
  name: string
  value?: string
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea name={name} defaultValue={value} required />
    </label>
  )
}

function ReviewBlock({ title, value }: ReviewBlockProps) {
  const { t } = useI18n()
  return (
    <section>
      <h3>{title}</h3>
      <p>{value || t("common.noNotes")}</p>
    </section>
  )
}

function Inventory({ user, items, setItems, open, notify }: any) {
  const { locale, status: translateStatus, t } = useI18n()
  const [reports, setReports] = useState<any[]>(() =>
    getStored("inwork-stock-reports", []),
  )
  const [reporting, setReporting] = useState(false)
  const [stockSearch, setStockSearch] = useState("")
  const [deleteItem, setDeleteItem] = useState<Item | null>(null)
  const adjust = (item: Item, amount: number) => {
    if (item.stock + amount < 0) return
    setItems(
      items.map((x: Item) =>
        x.id === item.id ? { ...x, stock: x.stock + amount } : x,
      ),
    )
    notify(t("inventory.updated"))
  }
  const saveReports = (next: any[]) => {
    setReports(next)
    localStorage.setItem("inwork-stock-reports", JSON.stringify(next))
  }
  const visibleItems = items.filter((item: Item) =>
    `${item.name} ${item.category} ${item.code}`
      .toLowerCase()
      .includes(stockSearch.toLowerCase()),
  )
  return (
    <>
      <PageHead
        eyebrow={t("inventory.eyebrow")}
        title={
          user.role === "admin"
            ? t("inventory.title")
            : t("inventory.availability")
        }
        description={
          user.role === "admin"
            ? t("inventory.managerDescription")
            : t("inventory.employeeDescription")
        }
        action={
          <button
            className="primary-button fit"
            onClick={() =>
              user.role === "admin" ? open() : setReporting(true)
            }
          >
            <Plus />
            {user.role === "admin"
              ? t("inventory.add")
              : t("inventory.submitReport")}
          </button>
        }
      />
      {user.role === "admin" && (
        <div className="inventory-grid">
          {items.map((item: Item, i: number) => (
            <article className="inventory-card" key={item.id}>
              <div className={`item-visual v${i}`}>
                <Package />
              </div>
              <div className="item-content">
                <div className="item-title">
                  <div>
                    <span>{item.category}</span>
                    <h3>{item.name}</h3>
                  </div>
                  <span
                    className={
                      item.stock <= item.minimum ? "stock low" : "stock"
                    }
                  >
                    {item.stock <= item.minimum
                      ? t("inventory.low")
                      : t("inventory.inStock")}
                  </span>
                </div>
                <p>
                  {item.code} · {item.location}
                </p>
                <div className="stock-count">
                  <strong>{item.stock}</strong>
                  <span>
                    {t("inventory.quantityAvailable", { unit: item.unit })}
                  </span>
                </div>
                <div className="stock-actions">
                  <button onClick={() => adjust(item, -1)}>−</button>
                  <span>{t("inventory.adjust")}</span>
                  <button onClick={() => adjust(item, 1)}>+</button>
                </div>
                <button
                  className="delete-item-button"
                  onClick={() => setDeleteItem(item)}
                >
                  <X />
                  {t("inventory.delete")}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      {user.role === "employee" && (
        <section aria-labelledby="stock-availability-title">
          <div className="section-title stock-section-title">
            <div>
              <h2 id="stock-availability-title">
                {t("inventory.availability")}
              </h2>
              <p>{t("inventory.readOnlyDescription")}</p>
            </div>
            <label className="search stock-search">
              <Search />
              <input
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
                placeholder={t("inventory.search")}
              />
            </label>
          </div>
          <div className="inventory-grid employee-stock-grid">
            {visibleItems.map((item: Item, i: number) => {
              const status =
                item.stock === 0
                  ? "Out of Stock"
                  : item.stock <= item.minimum
                    ? "Low Stock"
                    : "Available"
              return (
                <article
                  className="inventory-card employee-stock-card"
                  key={item.id}
                >
                  <div className={`item-visual v${i % 3}`}>
                    <Package />
                  </div>
                  <div className="item-content">
                    <div className="item-title">
                      <div>
                        <span>{item.category}</span>
                        <h3>{item.name}</h3>
                      </div>
                      <span
                        className={`stock ${
                          status === "Available"
                            ? ""
                            : status === "Low Stock"
                              ? "low"
                              : "out"
                        }`}
                      >
                        {status === "Out of Stock"
                          ? t("inventory.out")
                          : status === "Low Stock"
                            ? t("inventory.low")
                            : t("inventory.available")}
                      </span>
                    </div>
                    <p>
                      {item.code} · {item.location}
                    </p>
                    <div className="stock-count">
                      <strong>{item.stock}</strong>
                      <span>
                        {t("inventory.quantityAvailable", { unit: item.unit })}
                      </span>
                    </div>
                    <div className="read-only-note">
                      <Eye />
                      {t("inventory.readOnly")}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
          {visibleItems.length === 0 && (
            <div className="empty-inline">{t("inventory.noMatch")}</div>
          )}
        </section>
      )}
      <div className="section-title">
        <h2>
          {user.role === "admin"
            ? t("inventory.employeeReports")
            : t("inventory.myHistory")}
        </h2>
        <p>
          {t("common.reportsSubmitted", {
            count: reports.length,
            suffix: reports.length === 1 ? "" : "s",
          })}
        </p>
      </div>
      <div className="panel report-list">
        {reports
          .filter(
            (r) => user.role === "admin" || r.employeeId === user.employeeId,
          )
          .map((r) => (
            <div className="report-row" key={r.id}>
              <div>
                <b>{r.itemName}</b>
                <small>
                  {r.employeeName} ·{" "}
                  {Number.isNaN(new Date(r.submitted).getTime())
                    ? r.submitted
                    : new Date(r.submitted).toLocaleString(locale)}
                </small>
              </div>
              <span>{t("inventory.system", { count: r.previous })}</span>
              <span>{t("inventory.reported", { count: r.quantity })}</span>
              <span className="status-badge">{translateStatus(r.status)}</span>
              {user.role === "admin" && r.status === "Pending Review" && (
                <div className="report-actions">
                  <button
                    onClick={() => {
                      saveReports(
                        reports.map((x) =>
                          x.id === r.id ? { ...x, status: "Approved" } : x,
                        ),
                      )
                      notify(t("inventory.approved"))
                    }}
                  >
                    {t("inventory.approve")}
                  </button>
                  <button
                    onClick={() =>
                      saveReports(
                        reports.map((x) =>
                          x.id === r.id
                            ? { ...x, status: "Needs Clarification" }
                            : x,
                        ),
                      )
                    }
                  >
                    {t("inventory.clarify")}
                  </button>
                  <button
                    onClick={() =>
                      saveReports(
                        reports.map((x) =>
                          x.id === r.id ? { ...x, status: "Rejected" } : x,
                        ),
                      )
                    }
                  >
                    {t("inventory.reject")}
                  </button>
                </div>
              )}
            </div>
          ))}
        {!reports.length && (
          <div className="empty-inline">{t("inventory.noReports")}</div>
        )}
      </div>
      {reporting && (
        <StockReportModal
          items={items}
          close={() => setReporting(false)}
          save={(item: Item, quantity: number, notes: string) => {
            saveReports([
              ...reports,
              {
                id: `SR-${Date.now()}`,
                employeeId: user.employeeId,
                employeeName: user.name,
                itemName: item.name,
                itemCode: item.code,
                previous: item.stock,
                quantity,
                notes,
                status: "Pending Review",
                submitted: new Date().toISOString(),
              },
            ])
            setReporting(false)
            notify(t("inventory.submitted"))
          }}
        />
      )}
      {deleteItem && (
        <div className="modal-wrap">
          <div className="modal confirm-modal">
            <span className="danger-icon">
              <X />
            </span>
            <h2>{t("inventory.deleteTitle", { name: deleteItem.name })}</h2>
            <p>
              {t("inventory.deleteDescription", {
                count: deleteItem.stock,
                unit: deleteItem.unit,
              })}
            </p>
            <div className="modal-actions">
              <button
                className="secondary-button"
                onClick={() => setDeleteItem(null)}
              >
                {t("common.cancel")}
              </button>
              <button
                className="delete-confirm"
                onClick={() => {
                  const archived = getStored<Item[]>(
                    "inwork-archived-items",
                    [],
                  )
                  localStorage.setItem(
                    "inwork-archived-items",
                    JSON.stringify([...archived, deleteItem]),
                  )
                  setItems(
                    items.filter((item: Item) => item.id !== deleteItem.id),
                  )
                  setDeleteItem(null)
                  notify(t("inventory.archived"))
                }}
              >
                {t("inventory.confirmDelete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function Notifications() {
  const { t } = useI18n()
  return (
    <>
      <PageHead
        eyebrow={t("notifications.eyebrow")}
        title={t("notifications.title")}
        description={t("notifications.description")}
      />
      <div className="panel notification-list">
        {[
          t("notifications.item1"),
          t("notifications.item2"),
          t("notifications.item3"),
          t("notifications.item4"),
        ].map((x, i) => (
          <div className="notice" key={x}>
            <span className={`activity-icon a${i % 3}`}>
              <Bell />
            </span>
            <div>
              <b>{x}</b>
              <p>
                {t("common.hoursAgo", { count: i + 1, suffix: i ? "s" : "" })}
              </p>
            </div>
            {i < 2 && <span className="unread" />}
          </div>
        ))}
      </div>
    </>
  )
}

function Profile({ user, setUser, employees, setEmployees, notify }: any) {
  const { locale, status, t } = useI18n()
  const [editing, setEditing] = useState(false)
  const employee = employees.find(
    (item: Employee) => item.id === user.employeeId,
  )
  const displayName = employee?.name || user.name
  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const name = String(data.get("name")).trim()
    const phone = String(data.get("phone")).trim()
    if (name.length < 2) return notify(t("profile.invalidName"))
    if (employee)
      setEmployees(
        employees.map((item: Employee) =>
          item.id === employee.id
            ? {
                ...item,
                name,
                phone,
                initials: name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase(),
              }
            : item,
        ),
      )
    const nextUser = { ...user, name }
    setUser(nextUser)
    localStorage.setItem("inwork-session", JSON.stringify(nextUser))
    setEditing(false)
    notify(t("profile.saved"))
  }
  return (
    <>
      <PageHead
        eyebrow={t("profile.eyebrow")}
        title={t("profile.title")}
        description={t("profile.description")}
        action={
          !editing ? (
            <button
              className="primary-button fit"
              onClick={() => setEditing(true)}
            >
              {t("profile.edit")}
            </button>
          ) : undefined
        }
      />
      <div className="profile-grid">
        <article className="panel profile-summary">
          <div className="profile-avatar">
            {displayName
              .split(" ")
              .map((x: string) => x[0])
              .join("")}
          </div>
          <h2>{displayName}</h2>
          <p>{user.position}</p>
          <span className="status-badge">{status("Active")}</span>
        </article>
        <form
          key={`${editing}-${displayName}`}
          className="panel profile-form"
          onSubmit={save}
        >
          <h2>{t("employees.personal")}</h2>
          <div className="form-grid">
            <label className="field">
              <span>{t("auth.fullName")}</span>
              <input
                name="name"
                defaultValue={displayName}
                disabled={!editing}
                required
              />
            </label>
            <label className="field">
              <span>{t("employees.email")}</span>
              <input
                name="email"
                type="email"
                defaultValue={employee?.email || user.email}
                disabled
              />
              <small>{t("profile.emailHelp")}</small>
            </label>
            <label className="field">
              <span>{t("profile.phone")}</span>
              <input
                name="phone"
                defaultValue={employee?.phone || ""}
                disabled={!editing}
              />
            </label>
            <label className="field">
              <span>{t("employees.department")}</span>
              <input
                name="department"
                defaultValue={user.department}
                disabled
              />
              <small>{t("profile.departmentHelp")}</small>
            </label>
          </div>
          {editing && (
            <div className="modal-actions profile-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setEditing(false)}
              >
                {t("common.cancel")}
              </button>
              <button className="primary-button fit">
                {t("common.saveChanges")}
              </button>
            </div>
          )}
        </form>
      </div>
    </>
  )
}

function SettingsPage({ dark, setDark, lang, setLang }: any) {
  const { t } = useI18n()
  return (
    <>
      <PageHead
        eyebrow={t("settings.eyebrow")}
        title={t("settings.title")}
        description={t("settings.description")}
      />
      <div className="settings-grid">
        <article className="panel setting-card">
          <span className="setting-icon">
            <Sun />
          </span>
          <div>
            <h3>{t("settings.appearance")}</h3>
            <p>{t("settings.appearanceHelp")}</p>
          </div>
          <button className="toggle-row" onClick={() => setDark(!dark)}>
            {dark ? <Moon /> : <Sun />}
            {dark ? t("settings.dark") : t("settings.light")}
            <span className={dark ? "switch on" : "switch"}>
              <i />
            </span>
          </button>
        </article>
        <article className="panel setting-card">
          <span className="setting-icon">
            <BriefcaseBusiness />
          </span>
          <div>
            <h3>{t("settings.language")}</h3>
            <p>{t("settings.languageHelp")}</p>
          </div>
          <select value={lang} onChange={(e) => setLang(e.target.value)}>
            <option value="en">English</option>
            <option value="id">Bahasa Indonesia</option>
          </select>
        </article>
        <article className="panel setting-card">
          <span className="setting-icon">
            <Bell />
          </span>
          <div>
            <h3>{t("nav.notifications")}</h3>
            <p>{t("settings.notificationsHelp")}</p>
          </div>
          <span className="switch on">
            <i />
          </span>
        </article>
        <article className="panel setting-card">
          <span className="setting-icon">
            <Archive />
          </span>
          <div>
            <h3>{t("settings.about")}</h3>
            <p>Manage Work. Empower People. · Version 1.0 Demo</p>
          </div>
        </article>
      </div>
    </>
  )
}

function AddModal({ type, employees, close, save }: any) {
  const { t } = useI18n()
  const title =
    type === "employee"
      ? t("modal.addEmployee")
      : type === "task"
        ? t("modal.addTask")
        : t("modal.addItem")
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const name = String(f.get("name"))
    if (type === "employee")
      save({
        id: String(f.get("code")),
        name,
        department: String(f.get("department")),
        position: String(f.get("position")),
        email: String(f.get("email")),
        status: "Active",
        initials: name
          .split(" ")
          .map((x) => x[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
      })
    if (type === "task")
      save({
        id: Date.now(),
        title: name,
        description: String(f.get("description")),
        assignee: "",
        priority: String(f.get("priority")),
        status: "Available",
        progress: 0,
        due: String(f.get("due")),
        requiredPosition: String(f.get("position")),
        slots: Number(f.get("slots")),
        claimedBy: [],
      })
    if (type === "item")
      save({
        id: Date.now(),
        name,
        code: String(f.get("code")),
        category: String(f.get("category")),
        stock: Number(f.get("stock")),
        minimum: Number(f.get("minimum")),
        unit: String(f.get("unit")),
        location: String(f.get("location")),
      })
  }
  return (
    <div className="modal-wrap" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-head">
          <div>
            <span className="eyebrow">{t("modal.newRecord")}</span>
            <h2>{title}</h2>
          </div>
          <button className="icon-button" onClick={close}>
            <X />
          </button>
        </div>
        <form onSubmit={submit}>
          <Field
            label={
              type === "task"
                ? t("modal.taskTitle")
                : type === "item"
                  ? t("modal.itemName")
                  : t("auth.fullName")
            }
            name="name"
            placeholder={t("modal.enterName")}
          />
          {type === "employee" && (
            <>
              <div className="form-grid">
                <Field
                  label={t("employees.id")}
                  name="code"
                  placeholder="IW-005"
                />
                <Field
                  label={t("employees.email")}
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                />
                <Field
                  label={t("employees.department")}
                  name="department"
                  placeholder={t("employees.department")}
                />
                <Field
                  label={t("employees.position")}
                  name="position"
                  placeholder={t("modal.roleTitle")}
                />
              </div>
            </>
          )}
          {type === "task" && (
            <>
              <Field
                label={t("modal.description")}
                name="description"
                placeholder={t("modal.descriptionPlaceholder")}
              />
              <div className="form-grid">
                <Field
                  label={t("tasks.requiredPosition")}
                  name="position"
                  placeholder={t("modal.positionExample")}
                />
                <Field
                  label={t("modal.slots")}
                  name="slots"
                  type="number"
                  placeholder="1"
                />
                <label className="field">
                  <span>{t("modal.priority")}</span>
                  <select name="priority">
                    <option value="High">{t("modal.high")}</option>
                    <option value="Medium">{t("modal.medium")}</option>
                    <option value="Low">{t("modal.low")}</option>
                  </select>
                </label>
                <Field
                  label={t("tasks.deadline")}
                  name="due"
                  placeholder="30 Jun"
                />
              </div>
            </>
          )}
          {type === "item" && (
            <>
              <div className="form-grid">
                <Field
                  label={t("modal.itemCode")}
                  name="code"
                  placeholder="AST-001"
                />
                <Field
                  label={t("modal.category")}
                  name="category"
                  placeholder={t("modal.equipmentExample")}
                />
                <Field
                  label={t("modal.initialStock")}
                  name="stock"
                  type="number"
                  placeholder="10"
                />
                <Field
                  label={t("modal.minimumStock")}
                  name="minimum"
                  type="number"
                  placeholder="3"
                />
                <Field
                  label={t("modal.unit")}
                  name="unit"
                  placeholder={t("modal.unitExample")}
                />
                <Field
                  label={t("modal.location")}
                  name="location"
                  placeholder={t("modal.locationExample")}
                />
              </div>
            </>
          )}
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={close}>
              {t("common.cancel")}
            </button>
            <button className="primary-button" type="submit">
              {type === "employee"
                ? t("modal.saveEmployee")
                : type === "task"
                  ? t("modal.saveTask")
                  : t("modal.saveItem")}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CameraAttendance({
  action,
  close,
  confirm,
}: {
  action: "checkIn" | "checkOut"
  close: () => void
  confirm: (photo: string) => void
}) {
  const { t } = useI18n()
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [photo, setPhoto] = useState("")
  const [error, setError] = useState("")
  const videoRef = (node: HTMLVideoElement | null) => {
    if (node && stream) {
      node.srcObject = stream
      node.play().catch(() => {})
    }
  }
  useEffect(() => {
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then(setStream)
      .catch(() => setError(t("attendance.cameraDenied")))
    return () => stream?.getTracks().forEach((track) => track.stop())
  }, [t])
  useEffect(
    () => () => stream?.getTracks().forEach((track) => track.stop()),
    [stream],
  )
  const capture = () => {
    const video = document.querySelector<HTMLVideoElement>(".camera-video")
    if (!video?.videoWidth) return setError(t("attendance.cameraNotReady"))
    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext("2d")?.drawImage(video, 0, 0)
    setPhoto(canvas.toDataURL("image/jpeg", 0.72))
  }
  const exit = () => {
    stream?.getTracks().forEach((track) => track.stop())
    close()
  }
  return (
    <div className="modal-wrap" role="dialog" aria-modal="true">
      <div className="modal camera-modal">
        <div className="modal-head">
          <div>
            <span className="eyebrow">{t("attendance.photoRequired")}</span>
            <h2>
              {t("attendance.withCamera", {
                action:
                  action === "checkIn"
                    ? t("attendance.checkIn")
                    : t("attendance.checkOut"),
              })}
            </h2>
          </div>
          <button className="icon-button" onClick={exit}>
            <X />
          </button>
        </div>
        <p className="camera-help">{t("attendance.cameraHelp")}</p>
        {error ? (
          <div className="camera-error">{error}</div>
        ) : photo ? (
          <img
            className="camera-preview"
            src={photo}
            alt={t("attendance.capturedEvidence")}
          />
        ) : (
          <video className="camera-video" ref={videoRef} muted playsInline />
        )}
        <div className="modal-actions">
          <button className="secondary-button" onClick={exit}>
            {t("common.cancel")}
          </button>
          {photo ? (
            <>
              <button className="secondary-button" onClick={() => setPhoto("")}>
                {t("attendance.retake")}
              </button>
              <button
                className="primary-button"
                onClick={() => {
                  stream?.getTracks().forEach((track) => track.stop())
                  confirm(photo)
                }}
              >
                {t("attendance.confirm")}
              </button>
            </>
          ) : (
            <button
              className="primary-button"
              disabled={!!error}
              onClick={capture}
            >
              {t("attendance.takePhoto")}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function EmployeeDetail({
  employee,
  close,
}: {
  employee: Employee
  close: () => void
}) {
  const { locale, status, t } = useI18n()
  return (
    <div className="modal-wrap">
      <div className="modal employee-detail">
        <div className="modal-head">
          <div>
            <span className="eyebrow">{t("employees.profile")}</span>
            <h2>{employee.name}</h2>
          </div>
          <button className="icon-button" onClick={close}>
            <X />
          </button>
        </div>
        <div className="employee-hero">
          <span className="profile-avatar">{employee.initials}</span>
          <div>
            <h2>{employee.name}</h2>
            <p>
              {employee.position} · {employee.department}
            </p>
            <span className="status-badge">{status(employee.status)}</span>
          </div>
        </div>
        <h3 className="detail-heading">{t("employees.personal")}</h3>
        <div className="detail-grid">
          <div>
            <small>{t("employees.id")}</small>
            <b>{employee.id}</b>
          </div>
          <div>
            <small>{t("employees.email")}</small>
            <b>{employee.email}</b>
          </div>
          <div>
            <small>{t("employees.phone")}</small>
            <b>{employee.phone || t("common.notProvided")}</b>
          </div>
          <div>
            <small>{t("employees.hireDate")}</small>
            <b>
              {formatStoredDate(employee.hireDate, locale, {
                day: "numeric",
                month: "short",
                year: "numeric",
              }) || t("common.notProvided")}
            </b>
          </div>
        </div>
        <h3 className="detail-heading">{t("employees.confidential")}</h3>
        <div className="detail-grid">
          <div>
            <small>{t("employees.department")}</small>
            <b>{employee.department}</b>
          </div>
          <div>
            <small>{t("employees.position")}</small>
            <b>{employee.position}</b>
          </div>
          <div>
            <small>{t("employees.salary")}</small>
            <b>
              {formatStoredSalary(employee.salary, locale) ||
                t("common.notRecorded")}
            </b>
          </div>
          <div>
            <small>{t("employees.taskCompletion")}</small>
            <b>{t("employees.seeTasks")}</b>
          </div>
        </div>
        <div className="modal-actions">
          <button className="primary-button" onClick={close}>
            {t("employees.back")}
          </button>
        </div>
      </div>
    </div>
  )
}

function StockReportModal({
  items,
  close,
  save,
}: {
  items: Item[]
  close: () => void
  save: (item: Item, quantity: number, notes: string) => void
}) {
  const { t } = useI18n()
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const item = items.find((x) => x.id === Number(f.get("item")))!
    save(item, Number(f.get("quantity")), String(f.get("notes")))
  }
  return (
    <div className="modal-wrap">
      <div className="modal">
        <div className="modal-head">
          <div>
            <span className="eyebrow">{t("inventory.physicalCheck")}</span>
            <h2>{t("inventory.submitReport")}</h2>
          </div>
          <button className="icon-button" onClick={close}>
            <X />
          </button>
        </div>
        <form onSubmit={submit}>
          <label className="field">
            <span>{t("inventory.item")}</span>
            <select name="item">
              {items.map((x) => (
                <option value={x.id} key={x.id}>
                  {x.name} · {x.code}
                </option>
              ))}
            </select>
          </label>
          <Field
            label={t("inventory.physicalQuantity")}
            name="quantity"
            type="number"
            placeholder="0"
          />
          <Field
            label={t("inventory.employeeNotes")}
            name="notes"
            placeholder={t("inventory.notesPlaceholder")}
          />
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={close}>
              {t("common.cancel")}
            </button>
            <button className="primary-button">
              {t("inventory.submitReview")}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
