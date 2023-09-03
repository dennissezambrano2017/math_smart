def user_email(request):
    user = request.user
    if user.is_authenticated:
        email = user.email
        username = user.username
        first_name = user.first_name
        last_name = user.last_name
    else:
        email = None
        username = None
        first_name = None
        last_name = None

    return {
        'user_email': email,
        'user_username': username,
        'user_first_name': first_name,
        'user_last_name': last_name
    }