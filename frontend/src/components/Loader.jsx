const Loader = () => {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-primary-500/20 rounded-full"></div>
        <div className="w-12 h-12 border-4 border-t-primary-500 border-transparent rounded-full animate-spin absolute top-0"></div>
      </div>
    </div>
  );
};

export default Loader;