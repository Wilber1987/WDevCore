/**
 * @typedef {Object} WNode
     * @property {String} [tagName]
     * @property {String} [id]
     * @property {String} [type]
     * @property {ElementStyle | String} [style]
     * @property {String} [className]
     * @property {String} [class]
     * @property {String} [name]
     * @property {String} [htmlFor]
     * @property {Boolean} [selected]
     * @property {Boolean} [checked]
     * @property {Boolean} [multiple]
     * @property {Boolean} [disabled]
     * @property {String} [src]
     * @property {String} [innerText]    
     * @property {String | Number} [min]
     * @property {String | Number} [max]   
     * @property {String | Number} [value]
     * @property {String} [innerHTML]
     * @property {String} [placeholder]
     * @property {String} [pattern]
     * @property {Array<HTMLElement | String | WNode | Object>} [children]
     * @property {Function} [onclick] 
     * @property {Function} [ondragover]
     * @property {Boolean} [draggable]
     * @property {Function} [onchange]
     * @property {Function} [onkeyup]
     * @property {Function} [ondrop]
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
/**
 * @typedef {Object} ResponseServices 
 *  * @property {int} [status]
    * @property {String} [message]
**/
class ResponseServices { }
function ModelFunction() { }
/**
 * @typedef {Object} ModelProperty 
    * @property {String} type - RADIO | DRAW | PASSWORD |
    CHECKBOX | TEXT | IMG | NUMBER | DATE | EMAIL | FILE | 
    TEL | TEXTAREA | MODEL | MASTERDETAIL | SELECT  | WSELECT | 
    CALENDAR | OPERATION (requiere un action para funcionar)
    * @property {Boolean} [hidden] desabilita la propiedad y la oculta
    * @property {Boolean} [hiddenInTable] oculta en la tabla
    * @property {Boolean} [require]
    * @property {Boolean} [disabled]
    * @property {String} [label]
    * @property {Array} [fileType]
    * @property {Array} [ControlAction] botones adicionales que se le agregan al control 
    * @property {String} [pattern]
    * @property {String} [defaultValue]
    * @property {String} [placeholder]
    * @property {String | Number} [min] para rangos de tipo number y date
    * @property {String | Number} [max] para rangos de tipo number y date
    * @property {String} [fieldRequire] CAMBIA UN ESTADO DE UNA PROPIEDAD A REQUERIDO
    * @property {Object | EntityClass | ModelFunction} [ModelObject]
    * @property { EntityClass | ModelFunction} [EntityModel]
    * @property {Array} [Dataset]
    * @property {Function} [action] Accion adicional que realizara el control cuando exista un cambio de valor recibe como parametro el objeto editado
    * @property {Function} [CalendarFunction] (obj) => {  }
    * @property {String} [SelfChargeDataset] Si es un WSELECT con el valor de esta propiedad puede usar datos para llenar el desplegable a partir de la entidad padre, es funcional para relaciones recursivas dentro de un master detail

**/
class ModelProperty { }
/**
 * @typedef {Object} FormConfig 
 *  * @property {Object} [ObjectDetail]
    * @property {Object} [EditObject]
    * @property {Object} [ParentModel]
    * @property {Object} [ParentEntity]
    * @property {Object} [UserActions]
    * @property {Object} [ModelObject]
    * @property {Object} [EntityModel]     
    * @property {Boolean} [DarkMode]
    * @property {Boolean} [AutoSave]
    * @property {Boolean} [DataRequire]
    * @property {String} [id] 
    * @property {String} [StyleForm] - columnX1 | columnX3 | columnX3   
    * @property {String} [DivColumns] - columnX1 | columnX3 | columnX3  
    * @property {Boolean} [Options]
    * @property {ObjectOptions} [ObjectOptions]
    * @property {String} [ImageUrlPath]
    * @property {Function} [SaveFunction]
    * @property {Function} [ValidateFunction]
    * @property {Function} [ProxyAction]
    * @property {HTMLStyleElement} [CustomStyle]
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

}
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
    * @property {Function} [EditAction] requiere Edit en true, recibe como parametro el elemnto
    * @property {Boolean} [Delete]
    * @property {Function} [DeleteAction] requiere Delete en true, recibe como parametro el elemnto
    * @property {Boolean} [Add]
    * @property {Boolean} [Search]
    * @property {Boolean} [Select]
    * @property {Function} [SelectAction] requiere select en true
    * @property {Boolean} [MultiSelect] funciona solo cuando select esta habilitado
    * @property {Array<Actions>} [UserActions]
    * @property {String} [UrlUpdate]
    * @property {String} [UrlAdd]
    * @property {String} [UrlDelete]
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
 *  * @property {Array} [Dataset]
    * @property {Array} [selectedItems]
    * @property {Object} [ModelObject]  
    * @property {Object} [EntityModel] 
    * @property {Object} [ParentModel]  
    * @property {Object} [ParentEntity]
    * @property {Boolean} [DarkMode]
    * @property {Boolean} [paginate]
    * @property {Boolean} [AddItemsFromApi]
    * @property {Boolean} [AutoSave]
    * @property {SearchItemsFromApi} [SearchItemsFromApi]
    * @property {String} [TypeMoney] 
    * @property {Number} [maxElementByPage] 
    * @property {TableOptions} [Options]
    * @property {String} [ImageUrlPath]
    * @property {String} [id]
    * @property {Function} [SaveFunction]
    * @property {String} [icon]   
    * @property {Function} [ValidateFunction]
    * @property {HTMLStyleElement} [CustomStyle] 
 **/
class TableConfig { };
/**
 * @typedef {Object} ModalConfig 
 *  * @property {Boolean} [ShadowRoot]
    * @property {String} [icon]
    * @property {String} [title]  
    * @property {Boolean} [HeadOptions]    
    * @property {String} [StyleForm]   columnX1 | columnX3 | columnX3
    * @property {String} [ImageUrlPath] 
    * @property {Object} [ModelObject] 
    * @property {Object} [EntityModel] 
    * @property {Object} [ObjectDetail]
    * @property {Object} [EditObject] 
    * @property {Object} [ParentModel]  
    * @property {Object} [ParentEntity]   
    * @property {Array} [UserActions] 
    * @property {ObjectOptions} [ObjectOptions] //recibe las opcions del formulario incluido el SaveFunction si esque existiera alguna
    * @property {Boolean} [AutoSave]
    * @property {Function} [ValidateFunction]
    * @property {Object | WNode | Node} [ObjectModal] nodo o componente html que se dibujara dentro del modal
    * @property {Boolean} [CloseOption]
    * @property {Function} [ProxyAction]
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
/**
 * @typedef {Object} FilterData 
 *  * @property {String} [PropName]
    * @property {String} [FilterType]
    * @property {Array<any>} [Values]
**/
class FilterData { }

export {
    WNode,
    ElementStyle,
    FormConfig,
    ModelFunction,
    ModelProperty,
    TableConfig,
    ModalConfig,
    FilterData
}