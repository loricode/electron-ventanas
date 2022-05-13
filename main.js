const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path'); 

let db = require('./src/config/database')

let win;
function createWindow () {
   win = new BrowserWindow({

    width: 800,
    height: 600,
    webPreferences: {

     // nodeIntegration: true,
     // contextIsolation:true,
     // devTools:false,
     preload:path.join(app.getAppPath(), './src/index.js')
      
    }
  })

  win.loadFile('./src/index.html')
}


app.whenReady().then(createWindow)



app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
})



ipcMain.handle('getDataTablaDos', () => {
   console.log("tabla dos")
});



ipcMain.handle('get', () => {
   getProducts()
});

ipcMain.handle('add', (event, obj) => {
  //addProduct(obj)


  //abres otra ventana modal y al cargar se ejecuta getDataTablaDos
  const child = new BrowserWindow({  parent: win, titleBarStyle: 'hidden', movable:false,
  webPreferences: {
    preload:path.join(app.getAppPath(), './src/views/home.js')
   }
})
  child.loadFile('./src/views/home.html')
  child.show();
 
});


ipcMain.handle('get_one', (event, obj) => {
  getproduct(obj)    
});

ipcMain.handle('remove_product', (event, obj) => {
  deleteproduct(obj)
});


ipcMain.handle('update', (event, obj) => {
  updateproduct(obj)    
});



function getProducts()
{
  
  db.query('SELECT * FROM products', (error, results, fields) => {
    if (error){
      console.log(error);
    }
    
    win.webContents.send('products', results)
  });  
}


function addProduct(obj)
{
  const sql = "INSERT INTO products SET ?";  
  db.query(sql, obj, (error, results, fields) => {
    if(error) {
       console.log(error);
    }
    getProducts()  
 });
}

function deleteproduct(obj)
{
  const { id }  = obj
  const sql = "DELETE FROM products WHERE id = ?"
  db.query(sql, id, (error, results, fields) => {
    if(error) {
       console.log(error);
    }
    getProducts()  
  });
}

function getproduct(obj)
{
  let { id } = obj 
  let sql = "SELECT * FROM products WHERE id = ?"
  db.query(sql, id, (error, results, fields) => {
    if (error){
      console.log(error);
    }
    console.log(results)
    win.webContents.send('product', results[0])
  });
}


function updateproduct(obj) 
{
   let { id, name, price } = obj
   const sql = "UPDATE products SET name=?, price=? WHERE id=?";  
   db.query(sql, [name, price, id], (error, results, fields) => {
     if(error) {
        console.log(error);
     }
     getProducts()  
   });
}


