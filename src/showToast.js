export function showToast(operation , name){
    const toast = document.createElement("div");
    toast.classList.add("toast");
    

    if (operation === "add") {
        toast.textContent = `Product with name ${name} has been added.`;
    }else{
        toast.textContent = `Product with name ${name} has been deleted.`;
    }

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 2000);
};