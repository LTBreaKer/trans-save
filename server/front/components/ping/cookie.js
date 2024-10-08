
// document.cookie="jwt_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzE3ODU2MTU4LCJpYXQiOjE3MTc3Njk3NTgsImp0aSI6ImEwZWMxOTNiY2EwNTQ5NWU5ZDkzOTlkYjRhZDczYThkIiwidXNlcl9pZCI6MX0.GiJBHld9Rgo2OMQwq7LJgyMsPdNONTp5eded5K8vdrg";
export function setCookie(name, value, days) {
	var expires = "";
    if (days) {
		var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

export function getCookie(name) {
	var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

export function deleteCookie(name) {
	document.cookie = name + '=; Max-Age=-99999999;';
}