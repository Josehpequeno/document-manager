import { Link, useNavigate } from "react-router-dom";
import logo from "../logo.png";
import { useAppDispatch } from "../store/store";
import { logout } from "../store/userSlice";
import { User } from "../Interfaces/User";

interface SideBarProps {
  user: User | null;
}

export default function SideBar({ user }: SideBarProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
    return;
  };

  return (
    <div className="min-h-screen relative flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 h-100 w-full max-w-[2.5rem] md:max-w-[12rem] p-1 md:p-4 shadow-xl shadow-blue-gray-900/5">
      <div className="mb-4 p-1 md:p-4 flex gap-2 items-center">
        <Link to="/home" className="flex gap-2">
          <img src={logo} className="w-6 md:w-8 rounded" alt="logo" />
          <h5 className="hidden md:block antialiased tracking-normal font-sans text-base md:text-xl font-semibold leading-snug text-gray-900">
            DocBeaver
          </h5>
        </Link>
      </div>
      <nav className="capitalize flex flex-col gap-4 min-w-[200px] p-0 md:p-2 font-sans text-base font-normal text-gray-700">
        <div
          role="button"
          tabIndex={0}
          className="flex items-center w-8 md:w-3/4 p-1 md:p-3 rounded-lg text-start leading-tight transition-all hover:bg-blue-50 hover:bg-opacity-80 focus:bg-blue-50 focus:bg-opacity-80 active:bg-blue-50 active:bg-opacity-80 hover:text-slate-950 focus:text-slate-950 active:text-slate-950 outline-none"
        >
          <div className="grid place-items-center mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className="h-6 w-6 md:h-5 md:w-5"
            >
              <path
                fillRule="evenodd"
                d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                clipRule="evenodd"
              ></path>
            </svg>
          </div>
          <h6 className="hidden md:block">{user?.name}</h6>
        </div>
        <Link to="/settings">
          <div
            role="button"
            tabIndex={0}
            className="flex items-center w-8 md:w-3/4 p-1 md:p-3 rounded-lg text-start leading-tight transition-all hover:bg-blue-50 hover:bg-opacity-80 focus:bg-blue-50 focus:bg-opacity-80 active:bg-blue-50 active:bg-opacity-80 hover:text-slate-950 focus:text-slate-950 active:text-slate-950 outline-none"
          >
            <div className="grid place-items-center mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                className="h-6 w-6 md:h-5 md:w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
            <h6 className="hidden md:block">Settings</h6>
          </div>{" "}
        </Link>
        <div
          role="button"
          tabIndex={0}
          className="flex items-center w-8 md:w-3/4 p-1 md:p-3 rounded-lg text-start leading-tight transition-all hover:bg-blue-50 hover:bg-opacity-80 focus:bg-blue-50 focus:bg-opacity-80 active:bg-blue-50 active:bg-opacity-80 hover:text-slate-950 focus:text-slate-950 active:text-slate-950 outline-none"
          onClick={() => handleLogout()}
        >
          <div className="grid place-items-center mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className="h-6 w-6 md:h-5 md:w-5"
            >
              <path
                fillRule="evenodd"
                d="M12 2.25a.75.75 0 01.75.75v9a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM6.166 5.106a.75.75 0 010 1.06 8.25 8.25 0 1011.668 0 .75.75 0 111.06-1.06c3.808 3.807 3.808 9.98 0 13.788-3.807 3.808-9.98 3.808-13.788 0-3.808-3.807-3.808-9.98 0-13.788a.75.75 0 011.06 0z"
                clipRule="evenodd"
              ></path>
            </svg>
          </div>
          <h6 className="hidden md:block">Log Out</h6>
        </div>
      </nav>
    </div>
  );
}
