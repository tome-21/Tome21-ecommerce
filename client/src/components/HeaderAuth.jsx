import useAuth from "../hooks/useAuth";
import Login from "./Login";

export default function HeaderAuth() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-8 w-24 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
    );
  }

  if (!user) return <Login />;

  return (
    <div className="flex items-center gap-4 text-sm font-medium">
      {/* User Badge */}
      <div className="group flex items-center gap-2.5 rounded-full border border-gray-200/80 bg-white/80 dark:border-gray-800 dark:bg-gray-900/80 px-3 py-1.5 shadow-sm backdrop-blur-md transition-all duration-200 hover:border-gray-300 hover:bg-gray-50/80 dark:hover:border-gray-700 dark:hover:bg-gray-800/80 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
        <img
          src={user.image_url}
          alt={user.name || "User avatar"}
          className="h-6 w-6 rounded-full object-cover ring-1 ring-gray-900/10 dark:ring-white/10"
        />
        <span className="max-w-[120px] truncate text-gray-800 dark:text-gray-200 font-semibold tracking-tight">
          {user.name}
        </span>
      </div>
    </div>
  );
}
