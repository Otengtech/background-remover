
const Loader = () => {
  return (
    <div
      className="flex items-center justify-center min-h-screen"
      role="status"
      aria-label="Loading"
    >
      <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );
};

export default Loader;
