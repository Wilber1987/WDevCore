# WForm

## 1. Introducción

`WForm` es un componente de la librería encargado de construir formularios dinámicos a partir de un modelo descriptivo.

Su funcionamiento se basa principalmente en la interpretación de objetos `ModelProperty`.

En lugar de definir manualmente cada control del formulario:

```javascript
input.type = "text";
input.name = "Nombres";
input.required = true;
```

se define la propiedad dentro de un `ModelComponent`:

```javascript
Nombres = {
    type: 'text',
    require: true
};
```

y posteriormente se entrega el modelo a `WForm`:

```javascript
new WForm({
    ModelObject: new Example_ModelComponent()
});
```

Por lo tanto:

```text
ModelComponent
      │
      │ contiene ModelProperty
      ▼
    WForm
      │
      │ interpreta metadata
      ▼
Controles del formulario
```

La responsabilidad de `WForm` es interpretar la definición del modelo y convertirla en una interfaz de edición.

---

# 2. Principio de funcionamiento

`WForm` funciona bajo un modelo declarativo.

El desarrollador declara:

```javascript
Nombre = {
    type: 'text'
};
```

y `WForm` determina que debe crear un control de texto.

Por ejemplo:

```javascript
Fecha = {
    type: 'date'
};
```

genera conceptualmente:

```html
<input type="date">
```

Mientras que:

```javascript
Sexo = {
    type: 'select',
    Dataset: [
        'Masculino',
        'Femenino'
    ]
};
```

genera un control de selección con las opciones indicadas.

El modelo no describe solamente los datos; también proporciona información suficiente para que `WForm` determine cómo debe representarse cada propiedad.

---

# 3. Crear un formulario

La creación básica de un formulario consiste en:

1. Importar `WForm`.
2. Crear una configuración.
3. Proporcionar un `ModelObject`.
4. Crear una instancia de `WForm`.
5. Agregarla a un contenedor.

Ejemplo:

```javascript
import { WForm } from "../../../WComponents/WForm.js";

const Config = {
    Title: "FORMULARIO - Controles Básicos",
    ModelObject: new Example_ModelComponent()
};

container.append(
    new WForm(Config)
);
```

La propiedad más importante de esta configuración es:

```javascript
ModelObject
```

porque es la fuente principal desde la cual `WForm` obtiene las propiedades que debe convertir en controles.

---

# 4. ModelObject

`ModelObject` representa el objeto descriptivo que contiene los `ModelProperty`.

Por ejemplo:

```javascript
class Example_ModelComponent extends EntityClass {

    Nombre = {
        type: 'text'
    };

    Edad = {
        type: 'number'
    };

    FechaNacimiento = {
        type: 'date'
    };

}
```

Posteriormente:

```javascript
const form = new WForm({
    ModelObject: new Example_ModelComponent()
});
```

`WForm` puede inspeccionar:

```text
Nombre
Edad
FechaNacimiento
```

y sus respectivas definiciones:

```text
Nombre
    type → text

Edad
    type → number

FechaNacimiento
    type → date
```

A partir de esta información construye los controles correspondientes.

---

# 5. ModelComponent como contrato del formulario

En este contexto, `ModelComponent` funciona como un contrato entre el modelo y `WForm`.

Por ejemplo:

```javascript
class Profile_ModelComponent extends EntityClass {

    Nombres = {
        type: 'text'
    };

    FechaNac = {
        type: 'date',
        require: true
    };

    Sexo = {
        type: 'select',
        Dataset: [
            'Masculino',
            'Femenino'
        ]
    };

}
```

El componente no necesita saber cómo construir un `<input>` o un `<select>`.

Simplemente declara:

```text
Nombres → text
FechaNac → date
Sexo → select
```

`WForm` se encarga de interpretar estas definiciones.

---

# 6. Ciclo de interpretación

El funcionamiento conceptual de `WForm` es:

```text
             ModelObject
                  │
                  ▼
          Inspección de propiedades
                  │
                  ▼
            ModelProperty
                  │
          ┌───────┴────────┐
          │                │
          ▼                ▼
         type          configuración
          │                │
          └───────┬────────┘
                  ▼
          Resolver control
                  │
                  ▼
          Crear componente
                  │
                  ▼
          Aplicar metadata
                  │
                  ▼
          Vincular valores
```

Por ejemplo:

```javascript
Edad = {
    type: 'number',
    min: 18,
    max: 100,
    require: true
};
```

puede interpretarse como:

```text
Control
    ↓
number

Validación
    ↓
required
min = 18
max = 100
```

---

# 7. Tipos de controles

`WForm` soporta diferentes tipos de `ModelProperty`.

Entre los tipos documentados se encuentran:

| Tipo             | Función                             |
| ---------------- | ----------------------------------- |
| `TEXT`           | Texto                               |
| `NUMBER`         | Número                              |
| `DATE`           | Fecha                               |
| `datetime-local` | Fecha y hora                        |
| `TIME`           | Hora                                |
| `TEXTAREA`       | Área de texto                       |
| `EMAIL`          | Correo electrónico                  |
| `TEL`            | Teléfono                            |
| `PASSWORD`       | Contraseña                          |
| `RADIO`          | Opciones tipo radio                 |
| `CHECKBOX`       | Casilla de selección                |
| `SELECT`         | Lista desplegable                   |
| `WSELECT`        | Selector personalizado              |
| `MULTISELECT`    | Selección múltiple                  |
| `IMG`            | Imagen                              |
| `imagecapture`   | Captura de imagen                   |
| `FILE`           | Archivo                             |
| `RICHTEXT`       | Texto enriquecido                   |
| `DRAW`           | Dibujo                              |
| `CALENDAR`       | Calendario                          |
| `MASTERDETAIL`   | Relación maestro-detalle            |
| `MODEL`          | Modelo asociado                     |
| `OPERATION`      | Campo calculado mediante una acción |
| `MONEY`          | Número tratado como dinero          |
| `PERCENTAGE`     | Número tratado como porcentaje      |

Los nombres pueden escribirse con diferentes combinaciones de mayúsculas/minúsculas según la implementación del componente.

---

# 8. Campos básicos

## Text

```javascript
/**@type {ModelProperty}*/
Nombre = {
    type: 'text'
};
```

Representa un campo de texto.

---

## Number

```javascript
/**@type {ModelProperty}*/
Edad = {
    type: 'number',
    min: 18,
    require: false
};
```

Permite configurar límites:

```javascript
min: 18
max: 100
```

---

## Date

```javascript
/**@type {ModelProperty}*/
Fecha = {
    type: 'date'
};
```

También puede recibir un valor inicial:

```javascript
Fecha = {
    type: 'date',
    defaultValue: new Date().toISO()
};
```

---

## DateTime

```javascript
/**@type {ModelProperty}*/
FechaHora = {
    type: 'datetime-local',
    defaultValue: new DateTime().toISO()
};
```

---

## Time

```javascript
/**@type {ModelProperty}*/
Hora = {
    type: 'time'
};
```

---

## TextArea

```javascript
/**@type {ModelProperty}*/
Descripcion = {
    type: 'textarea'
};
```

---

## Checkbox

```javascript
/**@type {ModelProperty}*/
Activo = {
    type: 'CHECKBOX'
};
```

---

# 9. Campos basados en Dataset

Algunos controles necesitan un conjunto de opciones.

La propiedad utilizada para esto es:

```javascript
Dataset
```

Por ejemplo:

```javascript
const Examples = [
    'Opción 1',
    'Opción 2',
    'Opción 3'
];
```

Puede utilizarse en:

```javascript
Estado = {
    type: 'select',
    Dataset: Examples
};
```

---

# 10. Radio

```javascript
/**@type {ModelProperty}*/
Sexo = {
    type: 'radio',
    Dataset: [
        'Masculino',
        'Femenino'
    ],
    require: false
};
```

El `Dataset` proporciona las opciones disponibles.

---

# 11. Select

```javascript
/**@type {ModelProperty}*/
Estado = {
    type: 'select',
    Dataset: [
        'ACTIVO',
        'INACTIVO'
    ]
};
```

`WForm` utiliza `Dataset` para generar las opciones del selector.

---

# 12. Password

```javascript
/**@type {ModelProperty}*/
Password = {
    type: 'Password',
    Dataset: Examples
};
```

Representa un campo destinado a valores de contraseña.

---

# 13. WSelect

`WSelect` es un selector especializado que puede trabajar con un modelo adicional.

Ejemplo:

```javascript
const Paises = [
    {
        Id: 1,
        Texto: "Nicaragua"
    },
    {
        Id: 2,
        Texto: "Salvador"
    }
];
```

La propiedad puede declararse:

```javascript
/**@type {ModelProperty}*/
Pais = {
    type: 'WSelect',
    ModelObject: () => new Paises_ModelComponent(),
    Dataset: Paises
};
```

Aquí existen dos conceptos:

```text
Dataset
    ↓
Datos disponibles

ModelObject
    ↓
Describe cómo interpretar esos datos
```

La función:

```javascript
() => new Paises_ModelComponent()
```

permite proporcionar el modelo de manera diferida.

---

# 14. MULTISELECT

`MULTISELECT` permite seleccionar múltiples elementos.

Ejemplo:

```javascript
/**@type {ModelProperty}*/
Paises = {
    type: 'MULTISELECT',
    ModelObject: () => new Paises_ModelComponent(),
    Dataset: [
        {
            Id: 1,
            Texto: "Nicaragua"
        },
        {
            Id: 2,
            Texto: "Salvador"
        }
    ]
};
```

La diferencia conceptual respecto a un `SELECT` es que el valor puede representar múltiples elementos.

---

# 15. Imágenes

## Una imagen

```javascript
/**@type {ModelProperty}*/
Foto = {
    type: 'img'
};
```

## Múltiples imágenes

```javascript
/**@type {ModelProperty}*/
Galeria = {
    type: 'images'
};
```

También existe configuración global mediante:

```javascript
ImageUrlPath
```

que permite establecer una ruta base para imágenes que no sean URLs completas o valores `base64`.

---

# 16. RichText

Para contenido enriquecido:

```javascript
/**@type {ModelProperty}*/
Contenido = {
    type: 'RICHTEXT'
};
```

Este tipo permite utilizar un editor especializado en lugar de un campo de texto convencional.

---

# 17. Draw

Para campos de dibujo:

```javascript
/**@type {ModelProperty}*/
Firma = {
    type: 'Draw'
};
```

---

# 18. Calendar

Para un calendario:

```javascript
/**@type {ModelProperty}*/
Eventos = {
    type: 'Calendar'
};
```

Puede complementarse con:

```javascript
CalendarFunction
```

para proporcionar los datos que utilizará el calendario.

Ejemplo conceptual:

```javascript
Eventos = {
    type: 'Calendar',

    CalendarFunction: () => {
        return [
            // datos del calendario
        ];
    }
};
```

---

# 19. MasterDetail

`masterdetail` permite describir una relación entre un objeto principal y objetos dependientes.

Ejemplo:

```javascript
/**@type {ModelProperty}*/
Direccion = {
    type: 'masterdetail',
    ModelObject: () => new Adress_ModelComponent()
};
```

Conceptualmente:

```text
Profile
   │
   └── Direccion
           │
           ▼
   Adress_ModelComponent
```

El `ModelObject` define el modelo descriptivo utilizado para construir el detalle.

Esto permite que un formulario pueda representar relaciones sin tener que construir manualmente el formulario secundario.

---

# 20. OPERATION

`OPERATION` permite crear una propiedad cuyo valor es obtenido mediante una función.

Ejemplo conceptual:

```javascript
Operacion = {
    type: 'OPERATION',

    action: () => {
        return new DateTime().getMonthFormatEs();
    }
};
```

La función:

```javascript
action
```

produce el valor de la propiedad.

Este mecanismo puede utilizarse para valores calculados o derivados.

---

# 21. Propiedades visuales

## label

Permite definir la etiqueta que verá el usuario.

```javascript
FechaNac = {
    type: 'date',
    label: 'Fecha de nacimiento'
};
```

---

## placeholder

Define un texto de ayuda dentro del control.

```javascript
Nombre = {
    type: 'text',
    placeholder: 'Ingrese su nombre'
};
```

---

## hidden

Oculta una propiedad.

```javascript
Correo = {
    type: 'email',
    hidden: true
};
```

También puede ser una función:

```javascript
Correo = {
    type: 'email',
    hidden: () => true
};
```

Esto permite que la visibilidad sea dinámica.

---

## disabled

Deshabilita la edición.

```javascript
Correo = {
    type: 'email',
    disabled: true
};
```

También puede utilizar una función:

```javascript
Correo = {
    type: 'email',
    disabled: () => true
};
```

---

# 22. Campos requeridos

`require` determina si un campo debe considerarse obligatorio.

```javascript
Nombre = {
    type: 'text',
    require: true
};
```

En `WForm`, el valor predeterminado de `require` es `true`.

Por lo tanto:

```javascript
Nombre = {
    type: 'text'
};
```

equivale conceptualmente a:

```javascript
Nombre = {
    type: 'text',
    require: true
};
```

Si se desea que no sea obligatorio:

```javascript
ORCID = {
    type: 'text',
    require: false
};
```

También puede utilizar una función:

```javascript
ORCID = {
    type: 'text',
    require: () => {
        return false;
    }
};
```

Esto permite establecer reglas dinámicas.

---

# 23. Validaciones

`WForm` puede utilizar diferentes propiedades para controlar la validación.

## min

```javascript
Edad = {
    type: 'number',
    min: 18
};
```

También puede utilizarse en fechas:

```javascript
Fecha = {
    type: 'date',
    min: '2000-01-01'
};
```

---

## max

```javascript
Edad = {
    type: 'number',
    max: 100
};
```

---

## pattern

Permite utilizar una expresión regular:

```javascript
DNI = {
    type: 'text',
    pattern: '^[0-9]{13}$'
};
```

---

## fieldRequire

Permite modificar el estado requerido de una propiedad.

```javascript
Campo = {
    type: 'text',
    fieldRequire: 'OtroCampo'
};
```

La interpretación concreta depende de la lógica del formulario y permite establecer dependencias entre propiedades.

---

# 24. Valores iniciales

`defaultValue` define el valor inicial del control.

Ejemplo:

```javascript
Fecha = {
    type: 'date',
    defaultValue: new Date().toISO()
};
```

Otro ejemplo:

```javascript
Pais = {
    type: 'select',
    Dataset: [
        'Nicaragua',
        'Honduras',
        'Costa Rica'
    ],
    defaultValue: 'Nicaragua'
};
```

Conceptualmente:

```text
ModelProperty
      │
      └── defaultValue
              │
              ▼
       Valor inicial
```

---

# 25. hiddenFilter

`hiddenFilter` no controla directamente la visibilidad dentro del formulario.

Su propósito está relacionado con los componentes de filtrado.

Por ejemplo:

```javascript
Id_Perfil = {
    type: 'number',
    primary: true,
    hiddenFilter: true
};
```

El campo puede existir y utilizarse en el formulario, pero no debe aparecer en los filtros generados para el modelo.

Esto permite que una misma metadata sea utilizada por diferentes componentes:

```text
ModelProperty
    │
    ├── WForm
    │     └── hidden
    │
    ├── WTable
    │     └── hiddenInTable
    │
    └── WFilter
          └── hiddenFilter
```

---

# 26. hiddenInTable

Controla la visibilidad de una propiedad en una tabla.

```javascript
Foto = {
    type: 'img',
    hiddenInTable: true
};
```

El campo puede aparecer en un formulario pero no en una tabla.

---

# 27. primary

Indica que una propiedad representa una clave primaria.

```javascript
Id_Perfil = {
    type: 'number',
    primary: true
};
```

Esta información puede ser utilizada por diferentes componentes de la arquitectura para identificar la entidad.

---

# 28. ModelObject en ModelProperty

Una propiedad puede tener su propio `ModelObject`.

Ejemplo:

```javascript
Pais = {
    type: 'WSELECT',
    ModelObject: () => new Paises_ModelComponent(),
    Dataset: Paises
};
```

Esto significa que el control no trabaja únicamente con valores simples, sino con objetos que tienen su propio modelo descriptivo.

Conceptualmente:

```text
WForm
 │
 └── Pais
      │
      ├── type → WSELECT
      │
      ├── Dataset → países
      │
      └── ModelObject
              │
              ▼
      Paises_ModelComponent
```

---

# 29. EntityModel

`EntityModel` permite asociar una entidad al campo.

```javascript
Pais = {
    type: 'WSELECT',
    EntityModel: () => new Paises_Model()
};
```

Mientras que:

```javascript
ModelObject
```

describe principalmente el modelo utilizado por el componente, `EntityModel` permite asociar la entidad que representa los datos.

La distinción permite separar:

```text
ModelObject
    ↓
¿Cómo se interpreta?

EntityModel
    ↓
¿Con qué entidad se trabaja?
```

---

# 30. Dataset

`Dataset` es una de las propiedades más reutilizadas.

Puede alimentar controles como:

```text
SELECT
RADIO
MASTERDETAIL
MULTISELECT
WSELECT
WCHECKBOX
```

Ejemplo:

```javascript
Dataset: [
    {
        Id: 1,
        Texto: 'Nicaragua'
    },
    {
        Id: 2,
        Texto: 'Salvador'
    }
]
```

No necesariamente representa un array de strings.

Puede contener objetos, dependiendo del componente que lo consuma.

---

# 31. Action

`action` permite reaccionar ante cambios en el valor de una propiedad.

Ejemplo:

```javascript
Provincia = {
    type: 'select',

    Dataset: [],

    action: (value) => {
        // ejecutar comportamiento
    }
};
```

Conceptualmente:

```text
Usuario modifica campo
          │
          ▼
       action()
          │
          ▼
Actualización de comportamiento
```

Esto permite crear campos dependientes y comportamientos dinámicos.

---

# 32. ControlAction

`ControlAction` permite agregar acciones adicionales directamente sobre un control.

Su estructura conceptual es:

```javascript
ControlAction: [
    {
        name: 'Acción',
        action: (
            EditingObject,
            form,
            control,
            propertyName
        ) => {
            // acción
        }
    }
]
```

Esto permite agregar botones u opciones adicionales al control.

Por ejemplo:

```javascript
ControlAction: [
    {
        name: 'Limpiar',
        action: (
            EditingObject,
            form,
            control,
            propertyName
        ) => {

            EditingObject[propertyName] = null;

        }
    }
]
```

---

# 33. SelfChargeDataset

`SelfChargeDataset` permite alimentar un `WSELECT` utilizando información proveniente de la entidad padre.

Es especialmente útil en relaciones recursivas o estructuras `masterdetail`.

Conceptualmente:

```text
Entidad padre
     │
     ▼
SelfChargeDataset
     │
     ▼
WSELECT
```

Esto permite que un componente detalle obtenga información desde su contexto padre.

---

# 34. Configuración del formulario

Además de `ModelObject`, `WForm` acepta opciones generales.

Una configuración completa puede ser:

```javascript
const Config = {

    Title: "Formulario de perfiles",

    ModelObject:
        new Tbl_Profiles_Model_ModelComponent(),

    limit: 1,

    Groups: [
        {
            Name: "Información personal",

            Propertys: [
                "Nombres",
                "Apellidos",
                "FechaNac",
                "Sexo"
            ],

            WithAcordeon: false
        }
    ]
};
```

---

# 35. Title

Define el título del formulario.

```javascript
Title: "Formulario de perfiles"
```

Es opcional.

---

# 36. limit

Define el número de columnas que puede utilizar el formulario.

```javascript
limit: 1
```

Por ejemplo:

```text
limit: 1

┌────────────────────┐
│ Nombre             │
├────────────────────┤
│ Apellido           │
├────────────────────┤
│ Fecha              │
└────────────────────┘
```

Mientras que un valor superior permite distribuir controles en varias columnas según la implementación visual de `WForm`.

---

# 37. Groups

`Groups` permite organizar propiedades en secciones.

Ejemplo:

```javascript
Groups: [
    {
        Name: "Información personal",

        Propertys: [
            "Nombres",
            "Apellidos",
            "FechaNac"
        ],

        WithAcordeon: false
    },

    {
        Name: "Información adicional",

        Propertys: [
            "Sexo",
            "Estado",
            "ORCID"
        ],

        WithAcordeon: true
    }
]
```

La propiedad:

```javascript
Propertys
```

contiene los nombres de las propiedades que pertenecen al grupo.

---

# 38. WithAcordeon

Permite determinar si un grupo se presenta como acordeón.

```javascript
{
    Name: "Información personal",
    Propertys: [
        "Nombres",
        "Apellidos"
    ],
    WithAcordeon: true
}
```

Esto permite crear formularios extensos sin mostrar todos los campos simultáneamente.

---

# 39. EditObject

`EditObject` representa el objeto cuyos valores se están editando.

```javascript
EditObject: profile
```

Por ejemplo:

```javascript
const profile = new Tbl_Profiles_Model({
    Id_Perfil: 10,
    Nombres: 'Juan',
    Apellidos: 'Pérez'
});

const form = new WForm({
    ModelObject: new Tbl_Profiles_Model_ModelComponent(),
    EditObject: profile
});
```

Aquí existe una separación importante:

```text
ModelObject
    ↓
Describe los campos

EditObject
    ↓
Contiene los valores
```

Esto permite utilizar el mismo `ModelComponent` para crear y editar diferentes objetos.

---

# 40. EntityModel

`EntityModel` permite proporcionar el modelo de entidad que está siendo editado.

Conceptualmente:

```text
ModelObject
    ↓
Definición del formulario

EntityModel
    ↓
Entidad / comportamiento de persistencia

EditObject
    ↓
Datos actuales
```

Esta separación es especialmente importante cuando `WForm` se utiliza junto con `EntityClass`.

---

# 41. ParentModel y ParentEntity

En escenarios maestro-detalle, el formulario puede recibir información del objeto padre.

### ParentModel

Representa el modelo del padre:

```javascript
ParentModel: parentModel
```

### ParentEntity

Representa la entidad padre:

```javascript
ParentEntity: parentEntity
```

Conceptualmente:

```text
ParentEntity
     │
     ▼
Formulario hijo
     │
     ▼
EditObject
```

Esto permite que los controles del formulario conozcan el contexto en el que están siendo editados.

---

# 42. AutoSave

`AutoSave` determina si el formulario debe realizar automáticamente las operaciones de persistencia.

```javascript
AutoSave: true
```

Cuando está habilitado, `WForm` puede utilizar los métodos proporcionados por el modelo de entidad, como:

```javascript
Save()
Update()
```

Conceptualmente:

```text
Usuario
   │
   ▼
Formulario
   │
   ▼
Validación
   │
   ▼
AutoSave
   │
   ▼
EntityModel
   │
   ├── Save()
   └── Update()
```

Esto conecta directamente `WForm` con la infraestructura de `EntityClass`.

---

# 43. Options

Controla si el formulario muestra opciones relacionadas con el guardado.

```javascript
Options: true
```

Puede utilizarse para controlar la presencia de las acciones estándar del formulario.

---

# 44. UserActions

Permite agregar acciones personalizadas al formulario.

Ejemplo:

```javascript
UserActions: [
    {
        name: "Duplicar",
        action: (EditingObject) => {

            console.log(
                "Duplicando",
                EditingObject
            );

        }
    }
]
```

Estas acciones se representan como opciones adicionales del formulario.

La diferencia con `ControlAction` es:

```text
UserActions
    ↓
Acciones del formulario completo

ControlAction
    ↓
Acciones de un campo específico
```

---

# 45. SaveFunction

`SaveFunction` permite ejecutar lógica personalizada después del proceso de guardado.

Conceptualmente:

```javascript
SaveFunction: (response) => {

    console.log(response);

}
```

Es independiente de `AutoSave`.

El flujo puede entenderse como:

```text
Guardar
   │
   ▼
AutoSave
   │
   ▼
Respuesta
   │
   ▼
SaveFunction
```

Esto permite ejecutar acciones posteriores como:

* Actualizar una tabla.
* Mostrar información adicional.
* Refrescar datos.
* Ejecutar lógica de aplicación.

---

# 46. ValidateFunction

Permite agregar una validación personalizada al formulario.

Debe devolver información que indique si la validación fue exitosa.

Conceptualmente:

```javascript
ValidateFunction: (EditingObject) => {

    if (!EditingObject.Nombres) {

        return {
            validate: false,
            message: "El nombre es obligatorio"
        };

    }

    return {
        validate: true
    };
}
```

El flujo conceptual es:

```text
Usuario intenta guardar
          │
          ▼
Validaciones del formulario
          │
          ▼
ValidateFunction
          │
      ┌───┴───┐
      ▼       ▼
   válido   inválido
      │       │
      ▼       ▼
  continuar  mensaje
```

---

# 47. ProxyAction

`ProxyAction` permite reaccionar globalmente a cambios realizados dentro del formulario.

Conceptualmente:

```javascript
ProxyAction: (
    EditingObject
) => {

    // reaccionar al cambio

}
```

A diferencia de `action`, que pertenece a un `ModelProperty`, `ProxyAction` permite interceptar cambios desde el nivel del formulario.

La diferencia conceptual es:

```text
ModelProperty.action
        ↓
Cambio de un campo específico


FormConfig.ProxyAction
        ↓
Cambio dentro del formulario
```

---

# 48. CustomStyle

`WForm` utiliza un `shadowRoot`, por lo que los estilos externos no necesariamente afectan directamente al contenido interno del componente.

`CustomStyle` permite proporcionar un `HTMLStyleElement` personalizado.

Conceptualmente:

```javascript
const style = document.createElement('style');

style.textContent = `
    .custom-control {
        margin-bottom: 10px;
    }
`;

const form = new WForm({
    ModelObject: new Example_ModelComponent(),
    CustomStyle: style
});
```

Esto permite personalizar visualmente el contenido interno del formulario.

---

# 49. ImageUrlPath

Permite establecer una ruta base para imágenes.

Ejemplo:

```javascript
ImageUrlPath: "/uploads/profiles/"
```

Es útil cuando una propiedad de imagen contiene:

```text
foto.jpg
```

en lugar de:

```text
https://example.com/uploads/profiles/foto.jpg
```

o un valor `base64`.

---

# 50. Relación entre FormConfig y ModelProperty

Es importante distinguir las dos capas de configuración.

## FormConfig

Configura el **formulario completo**:

```text
Title
Groups
limit
AutoSave
UserActions
ValidateFunction
SaveFunction
ProxyAction
CustomStyle
```

## ModelProperty

Configura un **campo específico**:

```text
type
label
require
disabled
hidden
Dataset
defaultValue
min
max
pattern
placeholder
ModelObject
EntityModel
action
ControlAction
```

Conceptualmente:

```text
WForm Config
      │
      ├── Title
      ├── Groups
      ├── AutoSave
      ├── UserActions
      └── ...
      │
      ▼
   ModelObject
      │
      ├── Property A → ModelProperty
      ├── Property B → ModelProperty
      ├── Property C → ModelProperty
      └── Property D → ModelProperty
```

---

# 51. Ejemplo completo

Un ejemplo más cercano a un modelo real:

```javascript
class Tbl_Profiles_Model_ModelComponent extends EntityClass {

    /**@type {ModelProperty}*/
    Id_Perfil = {
        type: 'number',
        primary: true,
        hiddenFilter: true
    };

    /**@type {ModelProperty}*/
    Nombres = {
        type: 'text',
        label: 'Nombres',
        placeholder: 'Ingrese los nombres'
    };

    /**@type {ModelProperty}*/
    Apellidos = {
        type: 'text',
        label: 'Apellidos',
        placeholder: 'Ingrese los apellidos'
    };

    /**@type {ModelProperty}*/
    FechaNac = {
        type: 'date',
        label: 'Fecha de nacimiento',
        hiddenFilter: true
    };

    /**@type {ModelProperty}*/
    Sexo = {
        type: 'select',
        Dataset: [
            'Masculino',
            'Femenino'
        ]
    };

    /**@type {ModelProperty}*/
    Correo_institucional = {
        type: 'email',
        label: 'Correo institucional',
        disabled: true
    };

    /**@type {ModelProperty}*/
    Estado = {
        type: 'select',
        Dataset: [
            'ACTIVO',
            'INACTIVO'
        ]
    };

}
```

El formulario:

```javascript
const Config = {

    Title: "Perfil",

    ModelObject:
        new Tbl_Profiles_Model_ModelComponent(),

    limit: 2,

    Groups: [

        {
            Name: "Información personal",

            Propertys: [
                "Nombres",
                "Apellidos",
                "FechaNac",
                "Sexo"
            ],

            WithAcordeon: false
        },

        {
            Name: "Información institucional",

            Propertys: [
                "Correo_institucional",
                "Estado"
            ],

            WithAcordeon: false
        }

    ]
};

container.append(
    new WForm(Config)
);
```

---

# 52. Arquitectura completa

La arquitectura puede visualizarse así:

```text
                    ModelComponent
                          │
                          │
                  ModelProperty[]
                          │
                          ▼
                       WForm
                          │
              ┌───────────┼───────────┐
              │           │           │
              ▼           ▼           ▼
            Input       Select      WSelect
              │           │           │
              └───────────┼───────────┘
                          │
                          ▼
                     EditObject
                          │
                          ▼
                     EntityModel
                          │
                          ▼
                     EntityClass
                          │
                ┌─────────┼─────────┐
                ▼         ▼         ▼
              Save      Update    Delete
                │         │         │
                └─────────┼─────────┘
                          ▼
                          API
```

Esto demuestra que `WForm` es una capa de presentación que consume la metadata declarada por el `ModelComponent`, mientras que `EntityClass` proporciona la infraestructura de persistencia.

---

# 53. Regla de diseño

Al trabajar con esta arquitectura, es recomendable mantener la siguiente separación:

### ModelComponent

Debe responder:

> **¿Cómo debe interpretarse esta propiedad?**

Ejemplo:

```javascript
Nombres = {
    type: 'text',
    require: true
};
```

### Model

Debe responder:

> **¿Qué valor tiene esta propiedad?**

Ejemplo:

```javascript
this.Nombres = 'Juan';
```

### WForm

Debe responder:

> **¿Cómo convierto esa definición en una interfaz de edición?**

### EntityClass

Debe responder:

> **¿Cómo consulto y persisto los datos?**

---

# 54. Resumen

`WForm` no necesita conocer de antemano la estructura específica de una entidad.

Su comportamiento se basa en interpretar `ModelProperty`.

El flujo principal es:

```text
ModelComponent
      │
      ▼
ModelProperty
      │
      ├── type
      ├── label
      ├── require
      ├── hidden
      ├── disabled
      ├── Dataset
      ├── defaultValue
      ├── min / max
      ├── pattern
      ├── ModelObject
      ├── EntityModel
      ├── action
      └── ControlAction
      │
      ▼
     WForm
      │
      ▼
Control dinámico
```

De esta forma, una misma definición de modelo puede ser utilizada por diferentes componentes de la librería.

Por ejemplo:

```text
ModelComponent
      │
      ├── WForm
      │     └── controles de edición
      │
      ├── WTable
      │     └── columnas
      │
      ├── WFilter
      │     └── filtros
      │
      └── otros componentes
            └── comportamiento específico
```

La principal ventaja de este enfoque es que **la metadata del modelo se convierte en un contrato reutilizable para toda la librería**.

El desarrollador define una propiedad una sola vez:

```javascript
Estado = {
    type: 'select',
    Dataset: [
        'ACTIVO',
        'INACTIVO'
    ]
};
```

y los componentes consumidores pueden decidir cómo utilizar esa información.

En el caso de `WForm`, esa información se transforma en un control de formulario, aplicando además sus reglas de visualización, validación, valores iniciales, acciones y relaciones.
