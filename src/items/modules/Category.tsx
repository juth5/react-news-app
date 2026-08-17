// Categoryモジュールが表示・選択のために本当に必要とするフィールドだけを持つ型。
// label/newsLabelのようなAPI呼び出し用のデータはページ側の型で持つ。
type CategoryOption = {
  id: string
  color: string
}

type CategoryProps = {
  categories: CategoryOption[]
  currentCategoryId: string
  onSelect: (category: CategoryOption) => void
}

// カテゴリー一覧を表示するだけのmodule。
// クリックされたら選ばれたcategoryを呼び出し側(page側)にそのまま渡す。
// APIを叩く処理は使っている側(page側)のuseEffectなどに任せる。
function Category({ categories, currentCategoryId, onSelect }: CategoryProps) {
  return (
    <div className="flex items-end justify-start overflow-x-scroll overflow-y-hidden scrollbar-none mb-[18px] px-[12px] sm:px-0">
      {categories.map((category) => (
        <button
          key={category.id}
          className={`${currentCategoryId === category.id ? "border-transparent" : "border-white"} shrink-0 grow-0 border text-white rounded-[10px] px-[12px] py-[2px] mr-[8px] cursor-pointer`}
          style={currentCategoryId === category.id ? { backgroundColor: category.color } : undefined}
          onClick={() => onSelect(category)}>
          {category.id}
        </button>
      ))}
    </div>
  )
}

export default Category

