
const socket= io.connect();


function render (data){

    const author = new normalizr.schema.Entity('authors')
    const mensaje = new normalizr.schema.Entity('mensajes', {
    author: author
    })

    
    const denormalizedData= normalizr.denormalize(data.result, [mensaje], data.entities)

    let cantidadnormalizada= JSON.stringify(data).length
    let cantidaddesnormalizada=JSON.stringify(denormalizedData).length

    let porcentajedecompresion= 100-((cantidadnormalizada*100)/cantidaddesnormalizada)
   
   const html= denormalizedData.map((elem, index)=>{
        return (`<div class="mensajes">
        <div class="datos">
        <strong style="color:blue; font-weight: bold;">${elem.author.alias}</strong>
        <em style="color:brown; ">${elem.time}</em>
        <em style="color:green; font-weight: italic;" >${elem.text}</em>
        </div>
        <div>
        <img src="${elem.author.avatar}" alt="avatar" width=100>
        </div>
        </div>`)
    }).join(" ");

    document.getElementById('messages').innerHTML= html
    document.getElementById('compression').innerHTML= "Compresión " +  porcentajedecompresion.toPrecision(4)

}

socket.on('messages', function(data) {render(data);});

function addMessage(e){
    let date = new Date();
    let dateStr =
    ("00" + date.getDate()).slice(-2) + "/" +
    ("00" + (date.getMonth() + 1)).slice(-2) + "/" +
  date.getFullYear() + " " +
  ("00" + date.getHours()).slice(-2) + ":" +
  ("00" + date.getMinutes()).slice(-2) + ":" +
  ("00" + date.getSeconds()).slice(-2);
    
    const mensaje= {
        author:{
            id:document.getElementById('email').value,
            nombre:document.getElementById('nombre').value,
            apellido:document.getElementById('apellido').value,
            edad:document.getElementById('edad').value,
            alias:document.getElementById('alias').value,
            avatar:document.getElementById('avatar').value,
        },
        text: document.getElementById('texto').value,
        time: dateStr,
    };
    socket.emit('new message', mensaje);
    return false;

}