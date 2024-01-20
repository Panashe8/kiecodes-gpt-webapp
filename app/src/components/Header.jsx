export default function Header({onNewChat}) {
    return (
        // Add horizontal padding that is responsive
        <div className="px-4 md:px-6 lg:px-8">
            <div className="flex flex-row p-4 bg-slate-500 rounded-xl my-4">
                <p className="text-3xl text-slate-200 font-semibold grow">Protea AI GPT</p>
                <button
                    className="bg-slate-400 hover:bg-green-800 text-white font-bold py-2 px-4 rounded"
                    onClick={onNewChat}
                >New chat</button>
            </div>
        </div>
    )
}
