const socket= io.connect();

function render (data){

    for (const iterador of data) {
        let contenedor = document.createElement("tr");
        contenedor.innerHTML = 
        `  
        <td> ${iterador.id}</td>
        <td>${iterador.title}</td>
        <td> ${iterador.price} </td>
        <td> <img src= ${iterador.thumbnail} width=100  alt=""> </td>
        `;
        document.getElementById("lineaproducto").appendChild(contenedor)

    
}}

function render2 (data){
        let contenedor = document.createElement("tr");
        contenedor.innerHTML = 
        `  
        <td> ${data.id}</td>
        <td>${data.title}</td>
        <td> ${data.price} </td>
        <td> <img src= ${data.thumbnail} width=100  alt=""> </td>
        `;
        document.getElementById("lineaproducto").appendChild(contenedor)

    
}

socket.on('lineaproducto', function(data) {render(data);});


socket.on('lineaproducto2', function(data) {render2(data);});

function addLineaproducto(e){
    const lineaproducto= {
        title: document.getElementById('title').value,
        price: document.getElementById('price').value,
        thumbnail: document.getElementById('thumbnail').value,
    };
    socket.emit('new lineaproducto', lineaproducto);
    return false;
    

}