class Producto {
    constructor(id, nombre, precio, descripcion, img, unidad = 1,) {
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
        this.descripcion = descripcion;
        this.unidad = unidad;
        this.img = img;
    }

    sumarUnidad() {
        this.unidad = this.unidad + 1;
    }

    restarUnidad() {
        this.unidad = this.unidad - 1;
        if (this.unidad > 1) {
            this.unidad--;
        }
    }

    detalleProducto() {
        return `<div class="card" style="width: 18rem;">
        <img src="${this.img}" class="card-img-top">
        <div class="card-body">
        <h5 class="card-title">${this.nombre}</h5>
        <p class="card-text">$${this.precio}</p>
        <p class="card-text">${this.descripcion}</p>
        <button><a class="btn btn-primary" id="sp-${this.id}">Agregar</a></button>
        </div>
    </div>`
    }

    detalleCompra() {
        return `<div class="card mb-3" style="max-width: 540px;">
        <div class="row g-0">
        <div class="col-md-4">
            <img src="${this.img}" class="img-fluid rounded-start">
        </div>
        <div class="col-md-8">
            <div class="card-body">
            <h5 class="card-title">${this.nombre}</h5>
            <p class="card-text">$${this.precio}</p>
            <button id="restar-${this.id}"><i class="fa-solid fa-minus"></i></button>
            ${this.unidad}
            <button id="agregar-${this.id}"><i class="fa-solid fa-plus"></i></button>
            <div><button class="btn btn-danger" id="ep-${this.id}"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
        </div>
    </div>`
    }
}

class ControlProducto {
    constructor() {
        this.listaProductos = []
    }

    agregar(producto) {
        if (producto instanceof Producto) {
            this.listaProductos.push(producto)
        }
    }

    async cargarProductosApi() {
        let listaProductosJSON = await fetch("API.json")
        let listaProductosJS = await listaProductosJSON.json()

        listaProductosJS.forEach(producto => {
            let nuevoProducto = new Producto(producto.id, producto.nombre, producto.precio, producto.descripcion, producto.img, producto.unidad = 1)
            this.agregar(nuevoProducto)
        })

        this.verDom()
    }

    verToastify() {
        Toastify({
            text: "Producto Agregado",
            duration: 3000,
            gravity: "top",
            position: "left",
            style: {
                background: "red",
            },
        })
            .showToast();
    }

    verDom() {
        let contenedor_prod = document.getElementById("productos")
        this.listaProductos.forEach((producto) => {
            contenedor_prod.innerHTML += producto.detalleProducto();
        })

        this.listaProductos.forEach(producto => {
            const sp = document.getElementById(`sp-${producto.id}`)

            sp.addEventListener("click", () => {
                carro.sumar(producto)
                carro.guardarStorage()
                carro.verDom()
                this.verToastify()
            })
        })
    }
}

class Carro {
    constructor() {
        this.listaCarro = []
    }

    sumar(producto) {
        let stock = this.listaCarro.some(prod => prod.id == producto.id)
        if (stock) {
            let prod = this.listaCarro.find(prod => prod.id == producto.id)
            prod.sumarUnidad()
        }
        else {
            if (producto instanceof Producto) {
                this.listaCarro.push(producto)
            }
        }
    }

    eliminar(eliminarProducto) {
        let indice = this.listaCarro.findIndex(producto => producto.id == eliminarProducto.id)
        this.listaCarro.splice(indice, 1)
    }

    guardarStorage() {
        let listaCarroJSON = JSON.stringify(this.listaCarro)
        localStorage.setItem("listaCarro", listaCarroJSON)
    }

    levantarStorage() {
        let listaCarroJSON = localStorage.getItem("listaCarro")
        let listaCarro = JSON.parse(listaCarroJSON)
        let listaAux = []
        if (listaCarro) {
            listaCarro.forEach(producto => {
                let nuevoProducto = new Producto(producto.id, producto.nombre, producto.precio, producto.descripcion, producto.img, producto.unidad)
                listaAux.push(nuevoProducto)
            })
        }

        this.listaCarro = listaAux;
    }


    verDom() {
        let contenedor_compra = document.getElementById("carro")
        contenedor_compra.innerHTML = "";
        this.listaCarro.forEach((producto) => {
            contenedor_compra.innerHTML += producto.detalleCompra();
        })

        this.listaCarro.forEach((producto) => {
            const eliminar = document.getElementById(`ep-${producto.id}`)
            eliminar.addEventListener("click", () => {
                this.eliminar(producto)
                this.guardarStorage()
                this.verDom()
            })
        })

        this.aumentarUnidad()
        this.disminuirUnidad()
        this.mostrarTotal()
    }

    aumentarUnidad() {
        this.listaCarro.forEach(producto => {
            const agregar = document.getElementById(`agregar-${producto.id}`)
            agregar.addEventListener("click", () => {
                producto.sumarUnidad()
                this.verDom()
            })
        })
    }

    disminuirUnidad() {
        this.listaCarro.forEach(producto => {
            const restar = document.getElementById(`restar-${producto.id}`)
            restar.addEventListener("click", () => {
                producto.restarUnidad()
                this.verDom()
            })
        })
    }


    finalizarCompra() {
        const finalizar = document.getElementById("finalizar")
        finalizar.addEventListener("click", () => {
            if (this.listaCarro.length > 0) {
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Compra Finalizada',
                    timer: 2000
                })
            } else

                Swal.fire({
                    position: 'center',
                    icon: 'warning',
                    title: 'Su carrito esta vacio!',
                    timer: 2000
                })
        })
    }

    compraTotal() {
        return this.listaCarro.reduce((acumulador, producto) => acumulador + producto.precio * producto.unidad, 0)
    }

    mostrarTotal() {
        const total = document.getElementById("total")
        total.innerText = `Precio total: $${this.compraTotal()}`
    }
}

const CP = new ControlProducto()
const carro = new Carro()

carro.levantarStorage()
carro.verDom()
carro.finalizarCompra()

CP.cargarProductosApi()