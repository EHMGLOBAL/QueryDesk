import { useEffect, useState } from "react";
import { PERMISSIONS } from "./data/constants.js";
import { seedQueries } from "./data/seedQueries.js";
import AppLayout from "./layouts/AppLayout.jsx";
import AnalyticsPage from "./pages/AnalyticsPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import DetailPage from "./pages/DetailPage.jsx";
import HelpCentrePage from "./pages/HelpCentrePage.jsx";
import ListPage from "./pages/ListPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import QueueLandingPage from "./pages/QueueLandingPage.jsx";
import RaisePage from "./pages/RaisePage.jsx";
import RulesPage from "./pages/RulesPage.jsx";
import { normaliseQueries, userCanSee } from "./utils/queryRules.js";

export default function App() {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem("querydesk_demo_data");
      return normaliseQueries(saved ? JSON.parse(saved) : seedQueries());
    } catch {
      return normaliseQueries(seedQueries());
    }
  });
  const [sessionUser, setSessionUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState("");
  const refDate = new Date();

  useEffect(() => {
    try {
      localStorage.setItem("querydesk_demo_data", JSON.stringify(data));
    } catch {
      // Local persistence is best-effort for this frontend-only prototype.
    }
  }, [data]);

  if (!sessionUser) {
    return <LoginPage onLogin={(user) => {
      setSessionUser(user);
      setPage("dashboard");
    }} />;
  }

  const permissions = PERMISSIONS[sessionUser.level] || PERMISSIONS.agent;
  const canAccessRules = sessionUser.level === "coordinator" || sessionUser.level === "admin";
  const visibleData = data.filter((query) => userCanSee(query, sessionUser));
  const current = data.find((query) => query.id === selected && userCanSee(query, sessionUser));
  const currentRootId = current?.parentId || current?.id;
  const currentParentQuery = current?.parentId ? data.find((query) => query.id === current.parentId && userCanSee(query, sessionUser)) : null;
  const currentChildrenQueries = currentRootId ? data.filter((query) => query.parentId === currentRootId && userCanSee(query, sessionUser)) : [];

  const open = (query) => setSelected(query.id);
  const update = (id, fn) => setData((queries) => normaliseQueries(queries.map((query) => (query.id === id ? fn(query) : query))));
  const create = (query) => {
    setData((queries) => [normaliseQueries([query])[0], ...queries]);
    setSelected(query.id);
  };
  const goto = (key) => {
    if (key === "rules" && canAccessRules) {
      setPage(key);
      setSelected(null);
      return;
    }
    if (!permissions.nav.includes(key)) {
      setNotice("You do not have permission to access that page.");
      return;
    }
    setPage(key);
    setSelected(null);
  };

  const resetDemo = () => {
    setData(normaliseQueries(seedQueries()));
    setSelected(null);
    setNotice("Demo data reset.");
  };

  const logout = () => {
    setSessionUser(null);
    setSelected(null);
    setNotice("");
  };

  const content = current ? (
    <DetailPage
      q={current}
      user={sessionUser}
      back={() => setSelected(null)}
      update={update}
      refDate={refDate}
      create={create}
      open={open}
      notify={setNotice}
      parentQuery={currentParentQuery}
      childrenQueries={currentChildrenQueries}
    />
  ) : page === "dashboard" ? (
    <Dashboard data={visibleData} open={open} refDate={refDate} openQueue={setPage} />
  ) : page.startsWith("queue-") ? (
    <QueueLandingPage type={page} data={visibleData} open={open} refDate={refDate} back={() => setPage("dashboard")} />
  ) : page === "all" ? (
    <ListPage
      title="Find Query"
      desc="Search by application number, name, surname, date of birth, email, QueryDesk status, eCIMS status or query details."
      data={visibleData}
      open={open}
      refDate={refDate}
      groupLinked
      separateStatusFilters
    />
  ) : page === "my" ? (
    <ListPage
      title="My Raised Queries"
      desc="Queries raised by you."
      data={visibleData.filter((query) => query.ownerId === sessionUser.id)}
      open={open}
      refDate={refDate}
      separateStatusFilters
    />
  ) : page === "raise" ? (
    <RaisePage data={visibleData} user={sessionUser} create={create} open={open} notify={setNotice} />
  ) : page === "analytics" && permissions.canViewReports ? (
    <AnalyticsPage data={visibleData} open={open} refDate={refDate} user={sessionUser} />
  ) : page === "rules" && canAccessRules ? (
    <RulesPage />
  ) : page === "help" ? (
    <HelpCentrePage />
  ) : (
    <Dashboard data={visibleData} open={open} refDate={refDate} openQueue={setPage} />
  );

  return (
    <AppLayout
      sessionUser={sessionUser}
      permissions={permissions}
      page={page}
      current={current}
      notice={notice}
      goto={goto}
      resetDemo={resetDemo}
      logout={logout}
      dismissNotice={() => setNotice("")}
      canAccessRules={canAccessRules}
    >
      {content}
    </AppLayout>
  );
}
