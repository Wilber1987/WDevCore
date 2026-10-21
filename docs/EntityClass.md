# EntityClass y ModelComponent

## 1. Introducción

`EntityClass` es la clase base de la librería para proporcionar capacidades comunes de comunicación con la API, consulta, persistencia y manipulación de datos.

Sin embargo, dentro de la arquitectura de la librería, una clase que termina en `_ModelComponent` **no debe entenderse únicamente como una entidad de base de datos**.

Su propósito principal es servir como una **clase guía o descriptiva** que permite declarar metadatos y comportamientos que otros componentes de la librería pueden interpretar.

Por ejemplo:

```javascript
class Tbl_Profiles_Model_ModelComponent extends EntityClass {
    constructor(props) {
        Object.assign(this, props);
    }

    /**@type {ModelProperty}*/
    Nombres = { type: 'text' };

    /**@type {ModelProperty}*/
    Apellidos = { type: 'text' };

    /**@type {ModelProperty}*/
    Sexo = {
        type: 'Select',
        Dataset: ['Masculino', 'Femenino']
    };
}
```

En este caso, `Nombres`, `Apellidos` y `Sexo` no son únicamente propiedades de datos.

También funcionan como **definiciones de cómo la librería debe tratar esos campos**.

---

# 2. Concepto general de la arquitectura

La arquitectura puede entenderse en dos niveles principales:

```text
                    EntityClass
                         │
             ┌───────────┴───────────┐
             │                       │
             ▼                       ▼
      ModelComponent              Model
             │                       │
             │                       │
    Define comportamiento       Contiene datos
    y metadatos                 de una entidad
             │                       │
             └───────────┬───────────┘
                         │
                         ▼
                 Componentes UI,
                 formularios,
                 filtros,
                 grids, CRUD,
                 relaciones, etc.
```

La diferencia fundamental es:

> **`ModelComponent` describe el modelo; `Model` representa los datos del modelo.**

---

# 3. `EntityClass`

`EntityClass` proporciona las operaciones comunes para trabajar con una entidad y comunicarse con la API.

Entre sus responsabilidades están:

* Consultar registros.
* Aplicar filtros.
* Buscar registros.
* Crear registros.
* Actualizar registros.
* Eliminar registros.
* Realizar peticiones `POST`.
* Convertir respuestas de la API en instancias del modelo.
* Preparar objetos antes de enviarlos al backend.

Los principales métodos son:

```text
Get()
Where()
Find()
GetByProps()
FindByProps()
Save()
Update()
Delete()
SaveWithModel()
GetData()
SaveData()
Post()
```

Por lo tanto, `EntityClass` constituye la infraestructura común sobre la que se construyen los modelos.

---

# 4. ModelComponent

Un `ModelComponent` extiende `EntityClass`, pero su función dentro de la librería es principalmente **describir el comportamiento de una entidad**.

Ejemplo:

```javascript
class Tbl_Profiles_Model_ModelComponent extends EntityClass {

    constructor(props) {
        Object.assign(this, props);
    }

    /**@type {ModelProperty}*/
    Nombres = {
        type: 'text'
    };

    /**@type {ModelProperty}*/
    Apellidos = {
        type: 'text'
    };

    /**@type {ModelProperty}*/
    Sexo = {
        type: 'Select',
        Dataset: [
            'Masculino',
            'Femenino'
        ]
    };
}
```

La clase está proporcionando información que otros componentes pueden utilizar para determinar:

* Qué campos existen.
* Qué tipo de campo debe utilizarse.
* Qué campos son obligatorios.
* Qué campo es la clave primaria.
* Qué campos deben aparecer en filtros.
* Qué campos deben ocultarse.
* Qué campos están deshabilitados.
* Qué opciones tiene un `Select`.
* Qué relaciones existen.
* Cómo se deben construir componentes relacionados.

---

# 5. ModelProperty

Las propiedades declaradas en un `ModelComponent` utilizan conceptualmente el tipo:

```javascript
/**@type {ModelProperty}*/
```

Una propiedad puede contener metadatos.

Por ejemplo:

```javascript
Nombres = {
    type: 'text'
};
```

o:

```javascript
FechaNac = {
    type: 'date',
    label: 'fecha de nacimiento',
    hiddenFilter: true
};
```

Esto permite que la librería interprete la propiedad sin necesidad de definir manualmente su comportamiento en cada componente.

---

# 6. Tipos de propiedades

Un `ModelProperty` puede especificar un tipo mediante:

```javascript
type
```

Por ejemplo:

```javascript
Nombres = {
    type: 'text'
};
```

```javascript
FechaNac = {
    type: 'date'
};
```

```javascript
Foto = {
    type: 'img'
};
```

```javascript
Sexo = {
    type: 'Select'
};
```

El significado exacto de cada `type` depende de los componentes de la librería que consumen esta metadata.

Por ejemplo:

```text
text
date
number
img
Select
masterdetail
```

pueden ser utilizados para determinar qué componente visual, editor o mecanismo de interacción debe utilizarse.

---

# 7. Propiedades de ModelProperty

## type

Define el tipo conceptual del campo.

```javascript
Nombres = {
    type: 'text'
};
```

---

## label

Permite definir una etiqueta personalizada para el campo.

```javascript
FechaNac = {
    type: 'date',
    label: 'fecha de nacimiento'
};
```

Si no se especifica un `label`, otro componente puede utilizar el nombre de la propiedad como etiqueta.

---

## require

Indica si la propiedad es requerida.

```javascript
ORCID = {
    type: 'text',
    require: false
};
```

Por ejemplo:

```javascript
DNI = {
    type: 'text',
    require: true
};
```

---

## hidden

Permite indicar que el campo no debe mostrarse.

```javascript
Correo_institucional = {
    type: 'text',
    disabled: true,
    hidden: true
};
```

---

## hiddenFilter

Permite controlar si una propiedad debe participar en interfaces de filtrado.

Por ejemplo:

```javascript
Foto = {
    type: 'img',
    require: false,
    hiddenFilter: true
};
```

La propiedad existe y puede ser utilizada por el modelo, pero se puede excluir de los filtros generados por componentes de la librería.

---

## disabled

Permite indicar que el campo debe mostrarse pero no permitir edición.

```javascript
Correo_institucional = {
    type: 'text',
    disabled: true
};
```

---

## primary

Indica que una propiedad representa la clave primaria.

```javascript
Id_Perfil = {
    type: 'number',
    primary: true,
    hiddenFilter: true
};
```

Esta metadata puede ser utilizada por otros componentes para identificar el registro.

---

# 8. Dataset

Algunos tipos de propiedades pueden recibir un conjunto de valores.

Por ejemplo:

```javascript
Sexo = {
    type: 'Select',
    Dataset: [
        'Masculino',
        'Femenino'
    ]
};
```

El componente que interpreta el `ModelProperty` puede utilizar `Dataset` para construir automáticamente las opciones disponibles.

Por ejemplo, un formulario podría generar:

```text
Sexo
┌─────────────────────┐
│ Masculino           │
│ Femenino            │
└─────────────────────┘
```

La ventaja es que el `ModelComponent` define la información una sola vez y los componentes consumidores pueden reutilizarla.

---

# 9. Relaciones entre modelos

Los `ModelComponent` también pueden describir relaciones entre entidades.

Por ejemplo:

```javascript
Tbl_Grupos_Profiles = {
    type: 'masterdetail',
    require: false,
    ModelObject: () =>
        new Tbl_Grupos_Profiles_ModelComponent()
};
```

Aquí:

```javascript
type: 'masterdetail'
```

indica que se trata de una relación maestro-detalle.

Mientras que:

```javascript
ModelObject: () =>
    new Tbl_Grupos_Profiles_ModelComponent()
```

indica cuál es el modelo que representa el detalle.

El uso de una función:

```javascript
() => new Tbl_Grupos_Profiles_ModelComponent()
```

permite crear el objeto cuando sea necesario y evita instanciarlo directamente durante la declaración de la clase.

---

# 10. Ejemplo completo de ModelComponent

Un `ModelComponent` puede verse así:

```javascript
class Tbl_Profiles_Model_ModelComponent extends EntityClass {

    /**
     * @param {Partial<Tbl_Profiles_Model_ModelComponent>} [props]
     */
    constructor(props) {
        Object.assign(this, props);
    }

    /**@type {ModelProperty}*/
    Foto = {
        type: 'img',
        require: false,
        hiddenFilter: true
    };

    /**@type {ModelProperty}*/
    Id_Perfil = {
        type: 'number',
        primary: true,
        hiddenFilter: true
    };

    /**@type {ModelProperty}*/
    Nombres = {
        type: 'text'
    };

    /**@type {ModelProperty}*/
    Apellidos = {
        type: 'text'
    };

    /**@type {ModelProperty}*/
    FechaNac = {
        type: 'date',
        label: 'fecha de nacimiento',
        hiddenFilter: true
    };

    /**@type {ModelProperty}*/
    Sexo = {
        type: 'Select',
        Dataset: [
            'Masculino',
            'Femenino'
        ],
        hiddenFilter: true
    };

    /**@type {ModelProperty}*/
    DNI = {
        type: 'text'
    };

    /**@type {ModelProperty}*/
    Correo_institucional = {
        type: 'text',
        label: 'correo',
        disabled: true,
        hidden: true
    };

    /**@type {ModelProperty}*/
    Estado = {
        type: 'Select',
        Dataset: [
            'ACTIVO',
            'INACTIVO'
        ]
    };

    /**@type {ModelProperty}*/
    ORCID = {
        type: 'text',
        require: false,
        hiddenFilter: true
    };
}
```

Esta clase no necesita contener toda la lógica de negocio del registro.

Su principal responsabilidad es **declarar cómo debe ser interpretado el modelo por la librería**.

---

# 11. Model

El `Model` representa la estructura de datos de una entidad.

Por ejemplo:

```javascript
export class Tbl_Profiles_Model extends EntityClass {

    /**
     * @param {Partial<Tbl_Profiles_Model>} [props]
     */
    constructor(props) {

        /** @type {number|null} */
        this.Id_Perfil = null;

        /** @type {string|null} */
        this.Nombres = null;

        /** @type {string|null} */
        this.Apellidos = null;

        /** @type {Date|null} */
        this.FechaNac = null;

        /** @type {number|null} */
        this.IdUser = null;

        /** @type {string|null} */
        this.Sexo = null;

        /** @type {string|null} */
        this.Foto = null;

        /** @type {string|null} */
        this.DNI = null;

        /** @type {string|null} */
        this.Correo_institucional = null;

        /** @type {string|null} */
        this.Estado = null;

        /** @type {number|null} */
        this.Id_Pais_Origen = null;

        /** @type {number|null} */
        this.Id_Institucion = null;

        /** @type {string|null} */
        this.Indice_H = null;

        /** @type {string|null} */
        this.ORCID = null;

        /** @type {Object|null} */
        this.Security_Users = null;

        /** @type {Object|null} */
        this.Cat_Paises = null;

        /** @type {Array<Object>|null} */
        this.Tbl_Case = null;

        /** @type {Array<Object>|null} */
        this.Tbl_Agenda = null;

        /** @type {Array<Object>|null} */
        this.Tbl_Grupos_Profiles = null;

        /** @type {Array<Object>|null} */
        this.Tbl_Participantes = null;

        Object.assign(this, props);
    }
}
```

Aquí el objetivo principal es representar **datos concretos**.

Por ejemplo:

```javascript
const profile = new Tbl_Profiles_Model({
    Id_Perfil: 10,
    Nombres: 'Juan',
    Apellidos: 'Pérez',
    Sexo: 'Masculino'
});
```

El objeto contiene valores reales:

```text
Id_Perfil → 10
Nombres   → Juan
Apellidos → Pérez
Sexo      → Masculino
```

---

# 12. Diferencia entre ModelComponent y Model

Esta diferencia es fundamental para entender la arquitectura.

| Característica                 | ModelComponent                     | Model             |
| ------------------------------ | ---------------------------------- | ----------------- |
| Propósito                      | Describir comportamiento/metadatos | Representar datos |
| Define `ModelProperty`         | Sí                                 | No necesariamente |
| Define tipos de campos         | Sí                                 | No                |
| Define `Dataset`               | Sí                                 | No                |
| Define `hiddenFilter`          | Sí                                 | No                |
| Define `primary`               | Sí                                 | No                |
| Define relaciones conceptuales | Sí                                 | Sí, como datos    |
| Contiene valores reales        | Puede, pero no es su objetivo      | Sí                |
| Se utiliza como guía           | Sí                                 | No                |
| Representa un registro         | No principalmente                  | Sí                |
| Puede extender `EntityClass`   | Sí                                 | Sí                |

En resumen:

```text
ModelComponent
     │
     │ describe
     ▼
Modelo / Entidad
     │
     │ contiene
     ▼
Datos
```

---

# 13. Dos clases para una misma entidad

Es completamente válido tener:

```text
Tbl_Profiles_Model_ModelComponent
```

y:

```text
Tbl_Profiles_Model
```

porque cumplen funciones diferentes.

### ModelComponent

```javascript
class Tbl_Profiles_Model_ModelComponent extends EntityClass {
    Id_Perfil = {
        type: 'number',
        primary: true
    };

    Nombres = {
        type: 'text'
    };

    Sexo = {
        type: 'Select',
        Dataset: [
            'Masculino',
            'Femenino'
        ]
    };
}
```

Describe:

```text
Id_Perfil → número / primary key
Nombres   → texto
Sexo      → Select
Sexo      → opciones Masculino/Femenino
```

### Model

```javascript
class Tbl_Profiles_Model extends EntityClass {

    constructor(props) {

        this.Id_Perfil = null;
        this.Nombres = null;
        this.Sexo = null;

        Object.assign(this, props);
    }
}
```

Representa:

```text
Id_Perfil → 10
Nombres   → "Juan"
Sexo      → "Masculino"
```

---

# 14. El ModelComponent como contrato para otros componentes

La principal utilidad de `ModelComponent` aparece cuando otros componentes de la librería pueden inspeccionar sus propiedades.

Conceptualmente:

```text
Tbl_Profiles_Model_ModelComponent
              │
              ▼
       introspección
              │
      ┌───────┼────────┐
      ▼       ▼        ▼
   Form     Filter    Grid
      │       │        │
      ▼       ▼        ▼
   Inputs   filtros   columnas
```

Por ejemplo, si un componente encuentra:

```javascript
Estado = {
    type: 'Select',
    Dataset: [
        'ACTIVO',
        'INACTIVO'
    ]
};
```

puede determinar que debe construir un selector.

Si encuentra:

```javascript
FechaNac = {
    type: 'date',
    hiddenFilter: true
};
```

puede determinar que:

* El campo debe tratarse como fecha.
* El campo puede mostrarse en un formulario.
* El campo no debe aparecer en el generador de filtros.

Por tanto, el `ModelComponent` actúa como una especie de **contrato declarativo** entre el modelo y los componentes de la librería.

---

# 15. EntityClass como comportamiento compartido

Aunque `ModelComponent` tiene un propósito descriptivo, sigue heredando de:

```javascript
EntityClass
```

Esto significa que puede disponer de los mecanismos comunes de la infraestructura.

Por ejemplo:

```javascript
class Product_Model_ModelComponent extends EntityClass {

    Name = {
        type: 'text'
    };
}
```

hereda capacidades como:

```text
Get
Where
Find
GetByProps
FindByProps
Save
Update
Delete
Post
```

Esto permite que la arquitectura mantenga un comportamiento común entre sus diferentes componentes.

---

# 16. Construcción de una entidad

Un flujo típico puede ser:

```text
                    API
                     │
                     ▼
             Tbl_Profiles_Model
                     │
                     │ datos
                     ▼
          ┌─────────────────────┐
          │ Id_Perfil = 10      │
          │ Nombres = "Juan"    │
          │ Sexo = "Masculino"  │
          └─────────────────────┘


       Tbl_Profiles_Model_ModelComponent
                     │
                     │ metadata
                     ▼
          ┌─────────────────────┐
          │ Nombres → text      │
          │ Sexo → Select       │
          │ Estado → Select     │
          │ Id → primary        │
          └─────────────────────┘
                     │
                     ▼
             Componentes UI
```

Una capa contiene los datos y otra describe cómo deben interpretarse.

---

# 17. Ejemplo práctico completo

### Definición del componente

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
        type: 'text'
    };

    /**@type {ModelProperty}*/
    Apellidos = {
        type: 'text'
    };

    /**@type {ModelProperty}*/
    Sexo = {
        type: 'Select',
        Dataset: [
            'Masculino',
            'Femenino'
        ]
    };

    /**@type {ModelProperty}*/
    Estado = {
        type: 'Select',
        Dataset: [
            'ACTIVO',
            'INACTIVO'
        ]
    };
}
```

### Definición del modelo

```javascript
class Tbl_Profiles_Model extends EntityClass {

    constructor(props) {

        this.Id_Perfil = null;
        this.Nombres = null;
        this.Apellidos = null;
        this.Sexo = null;
        this.Estado = null;

        Object.assign(this, props);
    }
}
```

### Instancia con datos

```javascript
const profile = new Tbl_Profiles_Model({
    Id_Perfil: 10,
    Nombres: 'Juan',
    Apellidos: 'Pérez',
    Sexo: 'Masculino',
    Estado: 'ACTIVO'
});
```

### Metadata

El `ModelComponent` puede ser consultado por otro componente para saber:

```text
Id_Perfil
    → number
    → primary

Nombres
    → text

Apellidos
    → text

Sexo
    → Select
    → Masculino / Femenino

Estado
    → Select
    → ACTIVO / INACTIVO
```

Mientras que el `Model` contiene:

```text
Id_Perfil = 10
Nombres = "Juan"
Apellidos = "Pérez"
Sexo = "Masculino"
Estado = "ACTIVO"
```

---

# 18. Relaciones

Las relaciones pueden aparecer tanto en el componente descriptivo como en el modelo de datos.

### En el ModelComponent

Se describe la relación:

```javascript
Tbl_Grupos_Profiles = {
    type: 'masterdetail',
    require: false,
    ModelObject: () =>
        new Tbl_Grupos_Profiles_ModelComponent()
};
```

### En el Model

Se almacena la información relacionada:

```javascript
this.Tbl_Grupos_Profiles = null;
```

o:

```javascript
this.Tbl_Grupos_Profiles = [];
```

Por lo tanto:

```text
ModelComponent
    ↓
Describe qué relación existe

Model
    ↓
Contiene los datos de esa relación
```

---

# 19. Convención de nombres

La arquitectura puede utilizar una convención como:

```text
<Entity>_ModelComponent
```

para las clases descriptivas.

Ejemplo:

```text
Tbl_Profiles_Model_ModelComponent
```

y:

```text
Tbl_Profiles_Model
```

La primera clase define principalmente:

```text
metadata
comportamiento
tipos
relaciones
restricciones
configuración de componentes
```

La segunda define principalmente:

```text
datos
valores
relaciones cargadas
estado de una entidad
```

---

# 20. Resumen conceptual

La idea principal puede resumirse de esta manera:

```text
EntityClass
    │
    ├── proporciona comportamiento común
    │
    ├── comunicación con API
    ├── CRUD
    ├── filtros
    └── búsquedas
         │
         ├─────────────────────┐
         ▼                     ▼
 ModelComponent              Model
         │                     │
         │                     │
    "¿Cómo debe             "¿Qué datos
     comportarse?"            tiene?"
         │                     │
         ▼                     ▼
      Metadata              Valores
         │                     │
         └──────────┬──────────┘
                    ▼
             Componentes
             de la librería
```

## Regla práctica

Cuando se necesite **describir cómo la librería debe interpretar una entidad**, se utiliza el `ModelComponent`.

Cuando se necesite **trabajar con los datos concretos de una entidad**, se utiliza el `Model`.

Por ejemplo:

```javascript
// Describe el campo
Nombres = {
    type: 'text'
};
```

frente a:

```javascript
// Contiene el valor
this.Nombres = 'Juan';
```

Esta separación permite que los componentes de la librería sean genéricos y puedan construir formularios, filtros, grids, relaciones y otras funcionalidades a partir de la metadata declarada en el `ModelComponent`, sin tener que conocer específicamente cada entidad de la aplicación.
