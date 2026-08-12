type TabOption = {
  id: string
  color: string
}

type TabProps = {
  tabs: TabOption[]
  currentTabId: String
  onSelect: (tab: TabOption) => void
}

function Tab({ tabs, currentTabId, onSelect }: TabProps) {
  return (
    <div className='flex items-end justify-center border-b border-white w-full mb-[18px]'>
      {/* mapで配列をループ */}
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`w-32 text-center text-white px-[20px] py-[6px] cursor-pointer text-lg sm:text-xl ${currentTabId === tab.id ? tab.color : 'bg-gray-500'} font-bold border border-white rounded-t-[20px] mr-[20px] last:mr-0`}
          onClick={() => onSelect(tab)}>
          {tab.id}
        </div>
      ))}
    </div>
  )
}

export default Tab

