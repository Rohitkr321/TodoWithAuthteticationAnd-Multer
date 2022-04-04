let loginDivNode = document.getElementById("loginDiv")
let usernameNode = document.getElementById("username");
let passwordNode = document.getElementById("password");
let loginNode = document.getElementById("login");
let messageNode = document.getElementById("message")



loginNode.onclick = login

function login() {

    let user = {
        username: usernameNode.value,
        password: passwordNode.value
    }

    let payload = JSON.stringify(user)

    let request = new XMLHttpRequest()
    request.open("POST", "/")
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(payload)

    request.addEventListener("load", () => {

        loginDivNode.removeChild(usernameNode)
        loginDivNode.removeChild(passwordNode)
        loginDivNode.removeChild(loginNode)

        if (request.status === 200) {
            localStorage.setItem("name", request.responseText);
            messageNode.innerHTML =`Welcome ${localStorage.getItem("name")}`
            messageNode.style.fontSize = "15px"
            location.href = "/home";
        }
        else if (request.status === 400) {

            messageNode.innerHTML = request.responseText
            let goBackButton = document.createElement("button");
            goBackButton.innerHTML = "Try Again"
            loginDivNode.appendChild(goBackButton);
            goBackButton.addEventListener("click", () => {
                location.href = "/";

            })
            heading.innerHTML = ""
        }
        else if (request.status === 404) {

            messageNode.innerHTML = request.responseText
            let goBackButton = document.createElement("button");
            goBackButton.innerHTML = "Create Account"
            loginDivNode.appendChild(goBackButton);
            goBackButton.addEventListener("click", () => {
                location.href = "/signup";

            })
            heading.innerHTML = ""
        }

       
    })
}