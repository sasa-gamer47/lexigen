import React from 'react'

const Sidebar = () => {

    const buttonStyle = "hover:bg-slate-700 cursor-pointer duration-200 ease-in-out transition durations-300 hover:text-white hover:opacity-50"


  return (
    <>
        <div className="absolute left-0 top-0 w-1/6 bottom-0 bg-black flex flex-col justify-center items-center opacity-25">
        </div>


        <div className="absolute left-0 top-20 w-1/6 bottom-0 flex flex-col justify-center items-center">
            <div className={`w-full h-1/3 flex justify-center items-center ${buttonStyle}`}>
                <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sky-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <h1 className="text-2xl text-sky-200">Create</h1>
                </div>
            </div>
            <div className={`w-full h-1/3 flex justify-center items-center ${buttonStyle}`}>
                <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sky-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <h1 className="text-2xl text-sky-200">Mind maps</h1>
                </div>
            </div>
            <div className={`w-full h-1/3 flex justify-center items-center ${buttonStyle}`}>
                <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sky-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h1 className="text-2xl text-sky-200">Quizs</h1>
                </div>
            </div>
            <div className={`w-full h-1/3 flex justify-center items-center ${buttonStyle}`}>
                <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sky-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h1 className="text-2xl text-sky-200">Powerpoints</h1>
                </div>
            </div>
            <div className={`w-full h-1/3 flex justify-center items-center ${buttonStyle}`}>
                <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sky-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h1 className="text-2xl text-sky-200">Profile</h1>
                </div>
            </div>
        </div>
    </>
  )
}

export default Sidebar