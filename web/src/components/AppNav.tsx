import { useEffect, useMemo } from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { Paths } from "routes/index";
import { useGlobalUser } from "hooks/GlobalUser";
import { API_BASE } from "utils/constants";
import ListView from "components/Common/ListView";
import { MatIcon } from "components/Common/Containers";
import { ButtonLink, StyledLink } from "components/Forms/Button";
import ThemeSelector from "./ThemeSelector";

const Menu = styled.nav`
  align-items: center;
  display: grid;
  grid-template-columns: repeat(3, max-content);

  ${ListView} li {
    padding: 0;
  }
  ${StyledLink}, .material-icons {
    color: white;
  }
`;
const API = API_BASE;

const AppNav = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { email } = useGlobalUser(["email"]);
  const [authUrl, authText, authTitle, authClass] = useMemo(() => {
    const url = email ? `${API}/logout/google?` : `${API}/login/google?`;
    return email
      ? [url, "Logout", `Log out ${email}`, "error"]
      : [url, "Login", "Log in", undefined];
  }, [email]);
  // Set authenticating state for reload
  const onAuth = () => {
    const authenticating = Number(!email);
    localStorage.setItem("authenticating", String(authenticating));
  };
  const routes = [Paths.Search.Index];
  if (email) routes.push(Paths.Dashboard.Index);
  // else routes.push(Paths.Categories.Index);

  // Write path to localStorage for login/logout
  // This allows a user to maintain context when they login via Google
  useEffect(() => {
    const current = pathname === "/login" ? "/dashboard" : pathname;
    const lastViewed = localStorage.getItem("nextPath") || current;
    const authenticating = localStorage.getItem("authenticating") === "1";

    if (email && authenticating) {
      localStorage.removeItem("nextPath");
      localStorage.removeItem("authenticating");
      navigate(lastViewed, { replace: true });
    } else if (!authenticating) localStorage.setItem("nextPath", current);
  }, [pathname, email]);

  return (
    <Menu className="app-menu">
      {/* Light/Dark Theme */}
      <ThemeSelector />

      {/* Navigation Links */}
      <ListView
        row
        className="menu-items slide-in-right"
        data={routes}
        itemText={({ path, text }: any) => (
          <StyledLink variant="transparent" to={path}>
            {text}
          </StyledLink>
        )}
      />

      {/* Login/Logout Link */}
      <ButtonLink
        className={authClass}
        href={authUrl}
        onClick={onAuth}
        title={authTitle}
      >
        <MatIcon icon="account_circle" />
        {authText}
      </ButtonLink>
    </Menu>
  );
};

export default AppNav;
