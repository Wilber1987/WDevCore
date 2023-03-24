/**
 * 
 */
class WNode {
    /**
     * 
     * @param {*} props 
     */
    constructor(props = {}) {
        for (const prop in props) {
            this[prop] = props[prop]
        }
        this.tagName = this.tagName ?? "div";
        this.children = this.children ?? [];
    }
     /**
     * @property {!String} [tagName="div"] 
     */
    tagName = "div";
     /**
     * @property {!String} [x="div"] 
     */
    type = new String();
    /**
     * @property {!String || !Object} [x="div"] 
     */
    style = new ElementStyle();
     /**
     * @property {!String} [x="div"] 
     */
    className = new String();
    /**
     * @property {!String} [innerText=]
     */
    innerText = new String();
    /**
     * @property {!String}  [x="div"] 
     */
    value = new String();
    /**
     * @property {!String} [x="div"] 
     */
    innerHTML = new String();
    /**
     * @property {!Array<WNode>} [x=[]] 
     */
    children = [] ?? { tagName: "", N: 0 };
    /** @param {function()} x */
    onclick = ()=>{} 
}
class ElementStyle {
    alignContent = null;
    alignItems = null;
    alignSelf = null;
    animation = null;
    animationDelay = null;
    animationDirection = null;
    animationDuration = null;
    animationFillMode = null;
    animationIterationCount = null;
    animationName = null;
    animationTimingFunction = null;
    animationPlayState = null;
    background = null;
    backgroundAttachment = null;
    backgroundColor = null;
    backgroundImage = null;
    backgroundPosition = null;
    backgroundRepeat = null;
    backgroundClip = null;
    backgroundOrigin = null;
    backgroundSize = null;
    backfaceVisibility = null;
    border = null;
    borderBottom = null;
    borderBottomColor = null;
    borderBottomLeftRadius = null;
    borderBottomRightRadius = null;
    borderBottomStyle = null;
    borderBottomWidth = null;
    borderCollapse = null;
    borderColor = null;
    borderImage = null;
    borderImageOutset = null;
    borderImageRepeat = null;
    borderImageSlice = null;
    borderImageSource = null;
    borderImageWidth = null;
    borderLeft = null;
    borderLeftColor = null;
    borderLeftStyle = null;
    borderLeftWidth = null;
    borderRadius = null;
    borderRight = null;
    borderRightColor = null;
    borderRightStyle = null;
    borderRightWidth = null;
    borderSpacing = null;
    borderStyle = null;
    borderTop = null;
    borderTopColor = null;
    borderTopLeftRadius = null;
    borderTopRightRadius = null;
    borderTopStyle = null;
    borderTopWidth = null;
    borderWidth = null;
    bottom = null;
    boxDecorationBreak = null;
    boxShadow = null;
    boxSizing = null;
    captionSide = null;
    caretColor = null;
    clear = null;
    clip = null;
    color = null;
    columnCount = null;
    columnFill = null;
    columnGap = null;
    columnRule = null;
    columnRuleColor = null;
    columnRuleStyle = null;
    columnRuleWidth = null;
    columns = null;
    columnSpan = null;
    columnWidth = null;
    content = null;
    counterIncrement = null;
    counterReset = null;
    cursor = null;
    direction = null;
    display = null;
    emptyCells = null;
    filter = null;
    flex = null;
    flexBasis = null;
    flexDirection = null;
    flexFlow = null;
    flexGrow = null;
    flexShrink = null;
    flexWrap = null;
    cssFloat = null;
    font = null;
    fontFamily = null;
    fontSize = null;
    fontStyle = null;
    fontVariant = null;
    fontWeight = null;
    fontSizeAdjust = null;
    fontStretch = null;
    hangingPunctuation = null;
    height = null;
    hyphens = null;
    icon = null;
    imageOrientation = null;
    isolation = null;
    justifyContent = null;
    left = null;
    letterSpacing = null;
    lineHeight = null;
    listStyle = null;
    listStyleImage = null;
    listStylePosition = null;
    listStyleType = null;
    margin = null;
    marginBottom = null;
    marginLeft = null;
    marginRight = null;
    marginTop = null;
    maxHeight = null;
    maxWidth = null;
    minHeight = null;
    minWidth = null;
    navDown = null;
    navIndex = null;
    navLeft = null;
    navRight = null;
    navUp = null;
    objectFit = null;
    objectPosition = null;
    opacity = null;
    order = null;
    orphans = null;
    outline = null;
    outlineColor = null;
    outlineOffset = null;
    outlineStyle = null;
    outlineWidth = null;
    overflow = null;
    overflowX = null;
    overflowY = null;
    padding = null;
    paddingBottom = null;
    paddingLeft = null;
    paddingRight = null;
    paddingTop = null;
    pageBreakAfter = null;
    pageBreakBefore = null;
    pageBreakInside = null;
    perspective = null;
    perspectiveOrigin = null;
    position = null;
    quotes = null;
    resize = null;
    right = null;
    scrollBehavior = null;
    tableLayout = null;
    tabSize = null;
    textAlign = null;
    textAlignLast = null;
    textDecoration = null;
    textDecorationColor = null;
    textDecorationLine = null;
    textDecorationStyle = null;
    textIndent = null;
    textJustify = null;
    textOverflow = null;
    textShadow = null;
    textTransform = null;
    top = null;
    transform = null;
    transformOrigin = null;
    transformStyle = null;
    transition = null;
    transitionProperty = null;
    transitionDuration = null;
    transitionTimingFunction = null;
    transitionDelay = null;
    unicodeBidi = null;
    userSelect = null;
    verticalAlign = null;
    visibility = null;
    whiteSpace = null;
    width = null;
    wordBreak = null;
    wordSpacing = null;
    wordWrap = null;
    widows = null;
    zIndex = null;
    gridTemplateColumns = null;
    gridTemplateRows = null;
    gridColumn = null;
    gridRow = null;
    gridGap = null;
};
export {WNode, ElementStyle}