import styled from "styled-components";

// icons
import {
  MdClose,
  MdDashboard,
  MdLogout,
  MdManageAccounts,
  MdMenu,
  MdPostAdd,
  MdViewList,
} from "react-icons/md";
import { SiGooglescholar } from "react-icons/si";
import { RiFileUserFill } from "react-icons/ri";

import { useRouter } from "next/router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "context/User";
import Login from "./Login";
import { signOut } from "firebase/auth";
import { auth } from "firebase.config";

interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
  const [activeMenu, setActiveMenu] = useState(false);
  const user = useAuth();
  const router = useRouter();

  const SideMenu = () => {
    return (
      <Sidebar>
        <MenuHeader>
          JustNyay{" "}
          <MdClose
            className="icon-close"
            onClick={() => setActiveMenu(false)}
          />
        </MenuHeader>
        <span
          style={{
            margin: ".5rem .75rem 2.75rem .75rem",
            display: "block",
            fontSize: ".8rem",
            opacity: ".8",
          }}
        >
          admin@justnyay.com
        </span>
        {options.map((option) => (
          <div
            className={`line ${router.asPath == option.link ? "active" : ""}`}
            key={option.id}
            onClick={() => {
              setActiveMenu(false);
              router.push(option.link);
            }}
          >
            {option.icon}
            <span>{option.title}</span>
          </div>
        ))}
        <div
          className={`line`}
          onClick={() => {
            signOut(auth).then(() => {
              setActiveMenu(false);
            });
          }}
        >
          <MdLogout className="icon" />
          <span>Logout</span>
        </div>
      </Sidebar>
    );
  };

  if (!user) {
    return <Login />;
  }

  return (
    <Main>
      {/* mobile menu */}
      <AnimatePresence exitBeforeEnter>
        {activeMenu && (
          <MobileMenu
            initial={{ x: "-100%" }}
            animate={{
              x: 0,
              transition: {
                duration: 0.3,
                ease: "easeInOut",
              },
            }}
            exit={{
              x: "-100%",
              transition: {
                duration: 0.3,
                ease: "easeInOut",
              },
            }}
          >
            <SideMenu />
          </MobileMenu>
        )}
      </AnimatePresence>

      {/* desktop menu */}
      <DesktopMenu>
        <SideMenu />
      </DesktopMenu>
      <section className="main-content">
        <Header>
          <MdMenu className="menu-icon" onClick={() => setActiveMenu(true)} />

          {/* option info */}
          {!activeMenu && <MenuHeader>JustNyay</MenuHeader>}
        </Header>
        {children}
      </section>
    </Main>
  );
};

const Main = styled.main`
  background: rgba(0, 0, 0, 0.03);
  overflow: scroll;
  height: 100vh;

  @media (min-width: 767px) {
    display: grid;
    grid-template-columns: 2.5fr 8fr;
  }

  .main-content {
    max-width: 95%;
    margin: 0 auto;

    @media (min-width: 425px) {
      margin: 0;
    }

    @media (min-width: 425px) {
      padding: 2rem;
      max-height: 100vh;
      overflow: scroll;
    }
  }
`;

const MenuHeader = styled.h2`
  margin: 0rem 0.75rem;
  font-weight: 600;
  font-size: 1.5rem;

  display: flex;
  justify-content: space-between;

  .icon-close {
    cursor: pointer;
    position: relative;
    top: 2px;

    @media (min-width: 767px) {
      display: none;
    }
  }
`;

const MobileMenu = styled(motion.div)`
  position: absolute;
  z-index: 100;
  width: 90%;

  @media (min-width: 425px) {
    width: 60%;
  }

  @media (min-width: 767px) {
    display: none;
  }
`;

const DesktopMenu = styled.div`
  display: none;

  @media (min-width: 767px) {
    display: block;
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;

  margin: 1rem 0.75rem;

  @media (min-width: 425px) {
    margin: 1rem 0rem;
  }

  .menu-icon {
    font-size: 2rem;
    cursor: pointer;
    &:hover {
      color: ${({ theme }) => theme.primaryAccent};
    }
  }

  span {
    font-size: 1.125rem;
    opacity: 0.8;
  }

  @media (min-width: 767px) {
    display: none;
  }
`;

const Sidebar = styled.aside`
  box-shadow: ${(props) => props.theme.shadowPrimary};
  background: #fff;
  padding: 2rem 0.5rem;
  min-height: 100vh;
  border-radius: 0 5px 5px 0;

  .line {
    cursor: pointer;
    margin: 0.5rem;
    transition: all 0.3s ease-in-out;
    padding: 0.75rem;

    display: flex;
    align-items: center;
    gap: 1rem;

    .icon {
      font-size: 1.125rem;
    }

    span {
      opacity: 0.8;
    }

    &:hover {
      transform: translateX(8px);
    }
  }

  .active {
    border-left: 4px solid ${(props) => props.theme.primaryAccent};
    background-color: rgba(75, 73, 172, 0.1);
    border-radius: 2px;
    .icon {
      color: ${(props) => props.theme.primaryAccent};
    }
  }
`;

const options = [
  {
    id: 1,
    title: "Dashboard",
    icon: <MdDashboard className="icon" />,
    link: "/",
  },
  {
    id: 2,
    title: "Customers",
    icon: <RiFileUserFill className="icon" />,
    link: "/customers",
  },
  {
    id: 2,
    title: "Orders",
    icon: <MdViewList className="icon" />,
    link: "/orders",
  },
  {
    id: 3,
    title: "Lawyers",
    icon: <SiGooglescholar className="icon" />,
    link: "/lawyers",
  },
  {
    id: 4,
    title: "Interns",
    icon: <MdManageAccounts className="icon" />,
    link: "/interns",
  },
  {
    id: 5,
    title: "Bill Order",
    icon: <MdPostAdd className="icon" />,
    link: "/bill",
  },
];

export default Layout;
