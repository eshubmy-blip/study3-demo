// 通用双语文案组件：英文在上，中文在下（中文行透明度 0.85）
export default function Bilingual({
  en,
  zh,
  className = '',
  enClassName = '',
  zhClassName = '',
  align = 'left',
  style = {}
}) {
  return (
    <div
      className={className}
      style={{
        textAlign: align,
        ...style
      }}
    >
      <div className={enClassName}>
        {en}
      </div>
      <div
        className={zhClassName}
        style={{ opacity: 0.85 }}
      >
        {zh}
      </div>
    </div>
  )
}


