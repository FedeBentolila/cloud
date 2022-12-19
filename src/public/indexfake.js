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
        document.getElementById("productosfalsos").appendChild(contenedor)

    
}}

socket.on('fakeproducts', function(data) {render(data);});




