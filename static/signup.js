let usernameNode = document.getElementById("username")
let passwordNode = document.getElementById("password")
let successNode = document.getElementById("success")
let signupNode = document.getElementById("signup")
let nameNode = document.getElementById("name");


signupNode.addEventListener("click",signup);
//create Account
function signup(event){

    
    if(usernameNode.value!="" && passwordNode.value!="" && nameNode.value!=""){
        let user ={
            username:usernameNode.value,
            password:passwordNode.value,
            name:nameNode.value
        }
    
        let payload = JSON.stringify(user);
        //API call

        let request = new XMLHttpRequest();
        request.open("POST","/signup")
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        request.send(payload)
        request.addEventListener("load",(event)=>{
            successNode.innerHTML =  request.responseText ;
        })
        clearForm();  
    }
    
}

// for clearForm after succesfuly registred.
function clearForm(user){
    usernameNode.value="";
    passwordNode.value="";
    nameNode.value="";
}
