/**
 * @typedef {Object} WNode
     * @property {String} [tagName]
     * @property {String} [id]
     * @property {String} [type]
     * @property {ElementStyle | String} [style]
     * @property {String} [className]
     * @property {String} [class]
     * @property {String} [htmlFor]
     * @property {Boolean} [selected]
     * @property {Boolean} [checked]
     * @property {Boolean} [multiple]
     * @property {String} [src]
     * @property {String} [innerText]     
     * @property {String | Number} [value]
     * @property {String} [innerHTML]
     * @property {String} [placeholder]
     * @property {String} [pattern]
     * @property {Array<HTMLElement | String | WNode | Object>} [children]
     * @property {Function} [onclick]
     * @property {Function} [onchange]
     * @property {Function} [onkeyup]
     * @property {Function} [onkeydown]
     * @property {Function} [onkeypress]
     * @property {Function} [onload]
 **/
class WNode {
    /**
     * 
     * @param {*} props 
     */
    constructor(props = {}) {
        for (const prop in props) {
            this[prop] = props[prop]
        }
    }
    tagName = "div";
    type = new String();
    style = new ElementStyle();
    className = new String();
    innerText = new String();
    value = new String();
    innerHTML = new String();
    children = [];
    onclick = () => { }
}
/**
 * @typedef {Object} ObjectOptions 
 *  * @property {Boolean} [AddObject]
    * @property {String} [Url]
    * @property {Function} [SaveFunction]
**/
function ModelFunction() { }
/**
 * @typedef {Object} ModelProperty 
    * @property {String} type -  TEXT | NUMBER | DATE | MODEL | MASTERDETAIL | SELECT | 
    * @property {Boolean} [hidden]
    * @property {Boolean} [require]
    * @property {String} [label]
    * @property {Array} [fileType]
    * @property {Array} [ControlAction]
    * @property {String} [pattern]
    * @property {String} [defaultValue]
    * @property {String} [placeholder]
    * @property {String} [fieldRequire]
    * @property {Object | EntityClass | ModelFunction} [ModelObject]
    * @property {Array} [Dataset]
    * @property {Function} [Operation] (obj) => {  }
    * @property {Function} [action] (obj) => {  }
    * @property {Function} [CalendarFunction] (obj) => {  }
**/
class ModelProperty { }
/**
 * @typedef {Object} FormConfig 
 *  * @property {Object} [ObjectDetail]
    * @property {Object} [EditObject]
    * @property {Object} [ParentModel]
    * @property {Object} [UserActions]
    * @property {Object} [ModelObject]    
    * @property {Boolean} [DarkMode]
    * @property {Boolean} [AutoSave]
    * @property {Boolean} [DataRequire]
    * @property {String} [StyleForm] - columnX1 | columnX3 | columnX3   
    * @property {String} [DivColumns] - columnX1 | columnX3 | columnX3  
    * @property {Boolean} [Options]
    * @property {ObjectOptions} [ObjectOptions]
    * @property {String} [ImageUrlPath]
    * @property {Function} [SaveFunction]
    * @property {Function} [ValidateFunction]
 **/
class FormConfig { };

/**
 * @typedef {Object} ElementStyle
     * @property {?String | undefined} [alignContent]
     * @property {?String | undefined} [alignItems]
     * @property {?String | undefined} [alignSelf]
     * @property {?String | undefined} [animation]
     * @property {?String | undefined} [animationDelay]
     * @property {?String | undefined} [animationDirection]
     * @property {?String | undefined} [animationDuration]
     * @property {?String | undefined} [animationFillMode]
     * @property {?String | undefined} [animationIterationCount]
     * @property {?String | undefined} [animationName]
     * @property {?String | undefined} [animationTimingFunction]
     * @property {?String | undefined} [animationPlayState]
     * @property {?String | undefined} [background]
     * @property {?String | undefined} [backgroundAttachment]
     * @property {?String | undefined} [backgroundColor]
     * @property {?String | undefined} [backgroundImage]
     * @property {?String | undefined} [backgroundPosition]
     * @property {?String | undefined} [backgroundRepeat]
     * @property {?String | undefined} [backgroundClip]
     * @property {?String | undefined} [backgroundOrigin]
     * @property {?String | undefined} [backgroundSize]
     * @property {?String | undefined} [backfaceVisibility]
     * @property {?String | undefined} [border]
     * @property {?String | undefined} [borderBottom]
     * @property {?String | undefined} [borderBottomColor]
     * @property {?String | undefined} [borderBottomLeftRadius]
     * @property {?String | undefined} [borderBottomRightRadius]
     * @property {?String | undefined} [borderBottomStyle]
     * @property {?String | undefined} [borderBottomWidth]
     * @property {?String | undefined} [borderCollapse]
     * @property {?String | undefined} [borderColor]
     * @property {?String | undefined} [borderImage]
     * @property {?String | undefined} [borderImageOutset]
     * @property {?String | undefined} [borderImageRepeat]
     * @property {?String | undefined} [borderImageSlice]
     * @property {?String | undefined} [borderImageSource]
     * @property {?String | undefined} [borderImageWidth]
     * @property {?String | undefined} [borderLeft]
     * @property {?String | undefined} [borderLeftColor]
     * @property {?String | undefined} [borderLeftStyle]
     * @property {?String | undefined} [borderLeftWidth]
     * @property {?String | undefined} [borderRadius]
     * @property {?String | undefined} [borderRight]
     * @property {?String | undefined} [borderRightColor]
     * @property {?String | undefined} [borderRightStyle]
     * @property {?String | undefined} [borderRightWidth]
     * @property {?String | undefined} [borderSpacing]
     * @property {?String | undefined} [borderStyle]
     * @property {?String | undefined} [borderTop]
     * @property {?String | undefined} [borderTopColor]
     * @property {?String | undefined} [borderTopLeftRadius]
     * @property {?String | undefined} [borderTopRightRadius]
     * @property {?String | undefined} [borderTopStyle]
     * @property {?String | undefined} [borderTopWidth]
     * @property {?String | undefined} [borderWidth]
     * @property {?String | undefined} [bottom]
     * @property {?String | undefined} [boxDecorationBreak]
     * @property {?String | undefined} [boxShadow]
     * @property {?String | undefined} [boxSizing]
     * @property {?String | undefined} [captionSide]
     * @property {?String | undefined} [caretColor]
     * @property {?String | undefined} [clear]
     * @property {?String | undefined} [clip]
     * @property {?String | undefined} [color]
     * @property {?String | undefined} [columnCount]
     * @property {?String | undefined} [columnFill]
     * @property {?String | undefined} [columnGap]
     * @property {?String | undefined} [columnRule]
     * @property {?String | undefined} [columnRuleColor]
     * @property {?String | undefined} [columnRuleStyle]
     * @property {?String | undefined} [columnRuleWidth]
     * @property {?String | undefined} [columns]
     * @property {?String | undefined} [columnSpan]
     * @property {?String | undefined} [columnWidth]
     * @property {?String | undefined} [content]
     * @property {?String | undefined} [counterIncrement]
     * @property {?String | undefined} [counterReset]
     * @property {?String | undefined} [cursor]
     * @property {?String | undefined} [direction]
     * @property {?String | undefined} [display]
     * @property {?String | undefined} [emptyCells]
     * @property {?String | undefined} [filter]
     * @property {?String | undefined} [flex]
     * @property {?String | undefined} [flexBasis]
     * @property {?String | undefined} [flexDirection]
     * @property {?String | undefined} [flexFlow]
     * @property {?String | undefined} [flexGrow]
     * @property {?String | undefined} [flexShrink]
     * @property {?String | undefined} [flexWrap]
     * @property {?String | undefined} [cssFloat]
     * @property {?String | undefined} [font]
     * @property {?String | undefined} [fontFamily]
     * @property {?String | undefined} [fontSize]
     * @property {?String | undefined} [fontStyle]
     * @property {?String | undefined} [fontVariant]
     * @property {?String | undefined} [fontWeight]
     * @property {?String | undefined} [fontSizeAdjust]
     * @property {?String | undefined} [fontStretch]
     * @property {?String | undefined} [hangingPunctuation]
     * @property {?String | undefined} [height]
     * @property {?String | undefined} [hyphens]
     * @property {?String | undefined} [icon]
     * @property {?String | undefined} [imageOrientation]
     * @property {?String | undefined} [isolation]
     * @property {?String | undefined} [justifyContent]
     * @property {?String | undefined} [left]
     * @property {?String | undefined} [letterSpacing]
     * @property {?String | undefined} [lineHeight]
     * @property {?String | undefined} [listStyle]
     * @property {?String | undefined} [listStyleImage]
     * @property {?String | undefined} [listStylePosition]
     * @property {?String | undefined} [listStyleType]
     * @property {?String | undefined} [margin]
     * @property {?String | undefined} [marginBottom]
     * @property {?String | undefined} [marginLeft]
     * @property {?String | undefined} [marginRight]
     * @property {?String | undefined} [marginTop]
     * @property {?String | undefined} [maxHeight]
     * @property {?String | undefined} [maxWidth]
     * @property {?String | undefined} [minHeight]
     * @property {?String | undefined} [minWidth]
     * @property {?String | undefined} [navDown]
     * @property {?String | undefined} [navIndex]
     * @property {?String | undefined} [navLeft]
     * @property {?String | undefined} [navRight]
     * @property {?String | undefined} [navUp]
     * @property {?String | undefined} [objectFit]
     * @property {?String | undefined} [objectPosition]
     * @property {?String | undefined} [opacity]
     * @property {?String | undefined} [order]
     * @property {?String | undefined} [orphans]
     * @property {?String | undefined} [outline]
     * @property {?String | undefined} [outlineColor]
     * @property {?String | undefined} [outlineOffset]
     * @property {?String | undefined} [outlineStyle]
     * @property {?String | undefined} [outlineWidth]
     * @property {?String | undefined} [overflow]
     * @property {?String | undefined} [overflowX]
     * @property {?String | undefined} [overflowY]
     * @property {?String | undefined} [padding]
     * @property {?String | undefined} [paddingBottom]
     * @property {?String | undefined} [paddingLeft]
     * @property {?String | undefined} [paddingRight]
     * @property {?String | undefined} [paddingTop]
     * @property {?String | undefined} [pageBreakAfter]
     * @property {?String | undefined} [pageBreakBefore]
     * @property {?String | undefined} [pageBreakInside]
     * @property {?String | undefined} [perspective]
     * @property {?String | undefined} [perspectiveOrigin]
     * @property {?String | undefined} [position]
     * @property {?String | undefined} [quotes]
     * @property {?String | undefined} [resize]
     * @property {?String | undefined} [right]
     * @property {?String | undefined} [scrollBehavior]
     * @property {?String | undefined} [tableLayout]
     * @property {?String | undefined} [tabSize]
     * @property {?String | undefined} [textAlign]
     * @property {?String | undefined} [textAlignLast]
     * @property {?String | undefined} [textDecoration]
     * @property {?String | undefined} [textDecorationColor]
     * @property {?String | undefined} [textDecorationLine]
     * @property {?String | undefined} [textDecorationStyle]
     * @property {?String | undefined} [textIndent]
     * @property {?String | undefined} [textJustify]
     * @property {?String | undefined} [textOverflow]
     * @property {?String | undefined} [textShadow]
     * @property {?String | undefined} [textTransform]
     * @property {?String | undefined} [top]
     * @property {?String | undefined} [transform]
     * @property {?String | undefined} [transformOrigin]
     * @property {?String | undefined} [transformStyle]
     * @property {?String | undefined} [transition]
     * @property {?String | undefined} [transitiontype]
     * @property {?String | undefined} [transitionDuration]
     * @property {?String | undefined} [transitionTimingFunction]
     * @property {?String | undefined} [transitionDelay]
     * @property {?String | undefined} [unicodeBidi]
     * @property {?String | undefined} [userSelect]
     * @property {?String | undefined} [verticalAlign]
     * @property {?String | undefined} [visibility]
     * @property {?String | undefined} [whiteSpace]
     * @property {?String | undefined} [width]
     * @property {?String | undefined} [wordBreak]
     * @property {?String | undefined} [wordSpacing]
     * @property {?String | undefined} [wordWrap]
     * @property {?String | undefined} [widows]
     * @property {?String | undefined} [zIndex]
     * @property {?String | undefined} [gridTemplateColumns]
     * @property {?String | undefined} [gridTemplateRows]
     * @property {?String | undefined} [gridColumn]
     * @property {?String | undefined} [gridRow]
     * @property {?String | undefined} [gridGap]
     */
class ElementStyle {
    /*     alignContent = undefined;
        alignItems = undefined;
        alignSelf = undefined;
        animation = undefined;
        animationDelay = undefined;
        animationDirection = undefined;
        animationDuration = undefined;
        animationFillMode = undefined;
        animationIterationCount = undefined;
        animationName = undefined;
        animationTimingFunction = undefined;
        animationPlayState = undefined;
        background = undefined;
        backgroundAttachment = undefined;
        backgroundColor = undefined;
        backgroundImage = undefined;
        backgroundPosition = undefined;
        backgroundRepeat = undefined;
        backgroundClip = undefined;
        backgroundOrigin = undefined;
        backgroundSize = undefined;
        backfaceVisibility = undefined;
        border = undefined;
        borderBottom = undefined;
        borderBottomColor = undefined;
        borderBottomLeftRadius = undefined;
        borderBottomRightRadius = undefined;
        borderBottomStyle = undefined;
        borderBottomWidth = undefined;
        borderCollapse = undefined;
        borderColor = undefined;
        borderImage = undefined;
        borderImageOutset = undefined;
        borderImageRepeat = undefined;
        borderImageSlice = undefined;
        borderImageSource = undefined;
        borderImageWidth = undefined;
        borderLeft = undefined;
        borderLeftColor = undefined;
        borderLeftStyle = undefined;
        borderLeftWidth = undefined;
        borderRadius = undefined;
        borderRight = undefined;
        borderRightColor = undefined;
        borderRightStyle = undefined;
        borderRightWidth = undefined;
        borderSpacing = undefined;
        borderStyle = undefined;
        borderTop = undefined;
        borderTopColor = undefined;
        borderTopLeftRadius = undefined;
        borderTopRightRadius = undefined;
        borderTopStyle = undefined;
        borderTopWidth = undefined;
        borderWidth = undefined;
        bottom = undefined;
        boxDecorationBreak = undefined;
        boxShadow = undefined;
        boxSizing = undefined;
        captionSide = undefined;
        caretColor = undefined;
        clear = undefined;
        clip = undefined;
        color = undefined;
        columnCount = undefined;
        columnFill = undefined;
        columnGap = undefined;
        columnRule = undefined;
        columnRuleColor = undefined;
        columnRuleStyle = undefined;
        columnRuleWidth = undefined;
        columns = undefined;
        columnSpan = undefined;
        columnWidth = undefined;
        content = undefined;
        counterIncrement = undefined;
        counterReset = undefined;
        cursor = undefined;
        direction = undefined;
        display = undefined;
        emptyCells = undefined;
        filter = undefined;
        flex = undefined;
        flexBasis = undefined;
        flexDirection = undefined;
        flexFlow = undefined;
        flexGrow = undefined;
        flexShrink = undefined;
        flexWrap = undefined;
        cssFloat = undefined;
        font = undefined;
        fontFamily = undefined;
        fontSize = undefined;
        fontStyle = undefined;
        fontVariant = undefined;
        fontWeight = undefined;
        fontSizeAdjust = undefined;
        fontStretch = undefined;
        hangingPunctuation = undefined;
        height = undefined;
        hyphens = undefined;
        icon = undefined;
        imageOrientation = undefined;
        isolation = undefined;
        justifyContent = undefined;
        left = undefined;
        letterSpacing = undefined;
        lineHeight = undefined;
        listStyle = undefined;
        listStyleImage = undefined;
        listStylePosition = undefined;
        listStyleType = undefined;
        margin = undefined;
        marginBottom = undefined;
        marginLeft = undefined;
        marginRight = undefined;
        marginTop = undefined;
        maxHeight = undefined;
        maxWidth = undefined;
        minHeight = undefined;
        minWidth = undefined;
        navDown = undefined;
        navIndex = undefined;
        navLeft = undefined;
        navRight = undefined;
        navUp = undefined;
        objectFit = undefined;
        objectPosition = undefined;
        opacity = undefined;
        order = undefined;
        orphans = undefined;
        outline = undefined;
        outlineColor = undefined;
        outlineOffset = undefined;
        outlineStyle = undefined;
        outlineWidth = undefined;
        overflow = undefined;
        overflowX = undefined;
        overflowY = undefined;
        padding = undefined;
        paddingBottom = undefined;
        paddingLeft = undefined;
        paddingRight = undefined;
        paddingTop = undefined;
        pageBreakAfter = undefined;
        pageBreakBefore = undefined;
        pageBreakInside = undefined;
        perspective = undefined;
        perspectiveOrigin = undefined;
        position = undefined;
        quotes = undefined;
        resize = undefined;
        right = undefined;
        scrollBehavior = undefined;
        tableLayout = undefined;
        tabSize = undefined;
        textAlign = undefined;
        textAlignLast = undefined;
        textDecoration = undefined;
        textDecorationColor = undefined;
        textDecorationLine = undefined;
        textDecorationStyle = undefined;
        textIndent = undefined;
        textJustify = undefined;
        textOverflow = undefined;
        textShadow = undefined;
        textTransform = undefined;
        top = undefined;
        transform = undefined;
        transformOrigin = undefined;
        transformStyle = undefined;
        transition = undefined;
        transitiontype = undefined;
        transitionDuration = undefined;
        transitionTimingFunction = undefined;
        transitionDelay = undefined;
        unicodeBidi = undefined;
        userSelect = undefined;
        verticalAlign = undefined;
        visibility = undefined;
        whiteSpace = undefined;
        width = undefined;
        wordBreak = undefined;
        wordSpacing = undefined;
        wordWrap = undefined;
        widows = undefined;
        zIndex = undefined;
        gridTemplateColumns = undefined;
        gridTemplateRows = undefined;
        gridColumn = undefined;
        gridRow = undefined; */
};
/**
 * @typedef {Object} Actions 
 * @property {String} name
 * @property {Function} action
 * **/
/**
 * @typedef {Object} TableOptions 
 *  * @property {Boolean} [AddObject]
    * @property {Boolean} [Show]
    * @property {Boolean} [Edit]
    * @property {Boolean} [Delete]
    * @property {Boolean} [Add]
    * @property {Boolean} [Search]
    * @property {Boolean} [Select]
    * @property {Array<Actions>} [UserActions]
    * @property {String} [UrlUpdate]
    * @property {String} [UrlAdd]
    * @property {String} [UrlSearch]
    * @property {Function} [AddFunction]
**/
/**
 * @typedef {Object} SearchItemsFromApi 
 * @property {String} [ApiUrl]
 * @property {Function} [action]
 * **/
/**
 * @typedef {Object} TableConfig 
 *  * @property {Array} Dataset
    * @property {Array} [selectedItems]
    * @property {Object} [ModelObject]  
    * @property {Object} [ParentModel]    
    * @property {Boolean} [DarkMode]
    * @property {Boolean} [paginate]
    * @property {Boolean} [AddItemsFromApi]
    * @property {SearchItemsFromApi} [SearchItemsFromApi]
    * @property {String} [TypeMoney] 
    * @property {Number} [maxElementByPage] 
    * @property {TableOptions} [Options]
    * @property {String} [ImageUrlPath]
    * @property {Function} [SaveFunction]
    * @property {String} [icon]   
    * @property {Function} [ValidateFunction]
 **/
class TableConfig { };
/**
 * @typedef {Object} ModalConfig 
 *  * @property {Boolean} [ShadowRoot]
    * @property {String} [icon]
    * @property {String} [title]  
    * @property {Boolean} [HeadOptions]    
    * @property {String} [StyleForm]   
    * @property {String} [ImageUrlPath] 
    * @property {Object} [ModelObject]
    * @property {Object} [ObjectDetail]
    * @property {Object} [EditObject] 
    * @property {Object} [ParentModel]     
    * @property {Array} [UserActions] 
    * @property {ObjectOptions} [ObjectOptions]
    * @property {Boolean} [AutoSave]
    * @property {Function} [ValidateFunction]
    * @property {Object | WNode | Node} [ObjectModal]
    * @property {Boolean} [CloseOption]
 **/
class ModalConfig {
    // ModelObject = {
    //     property: undefined,
    //     Operation: {
    //         type: "OPERATION", action: (obj) => {
    //             return obj.value1 + obj.value2;
    //         }
    //     }
    // };
}

export {
    WNode,
    ElementStyle,
    FormConfig,
    ModelFunction,
    ModelProperty,
    TableConfig,
    ModalConfig
}