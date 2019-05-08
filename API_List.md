<!-- Sign up -->
# POST
Header Set
@ userid
@ projectid

# http://192.168.1.45:3000/users/SignUp 

 @ firstname
 @ lastname 
 @ email


<!-- Verify User -->
# http://192.168.1.45:3001/users/Verify_user/C9p1UEo561PdLwRdcouaL4
@ uid

<!-- Login -->
# POST
# http://192.168.1.45:3001/users/Login
@ username
@ password
@ projectid

<!-- Forgot password -->
# POST
Header Set
@ userid
@ projectid

# http://192.168.1.45:3001/users/Forgotpsw/05veera05@gmail.com
@ email 



<!-- Change Password -->
# POST
# http://192.168.1.45:3001/users/ChangePsw
@ email
@ o_password
@ n_password


#
#
#
#
#
#