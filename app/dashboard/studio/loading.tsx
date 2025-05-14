export default function LoadingStudio() {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-myred-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <h2 className="mt-4 text-xl font-semibold text-white">Loading your writing studio...</h2>
        </div>
      </div>
    );
}