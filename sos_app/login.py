from django.http import HttpResponse, HttpResponseRedirect
from django.template import RequestContext, loader

from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout



@csrf_exempt
def user_login(request):
    post = request.POST

    if request.user:
        logout(request)

    print request

    if post == {}:
        template = loader.get_template('sos_app/login.html')
        context = RequestContext(request, {})
        return HttpResponse(template.render(context))
    else:
        username = post['username']
        password = post['password']
        # do this way for now
        # update_database(None)
        user = authenticate(username=username, password=password)
        if user:
            if user.is_active:
                # If the account is valid and active, we can log the user in.
                # We'll send the user back to the homepage.
                login(request, user)
                template = loader.get_template('sos_app/login.html')
                context = RequestContext(request, {})
                return HttpResponse(template.render(context))
            else:
                # An inactive account was used - no logging in!
                return HttpResponse("Your account is disabled.")
        else:
            # Bad login details were provided. So we can't log the user in.
            print "Invalid login details: {0}, {1}".format(username, password)
            return HttpResponse("Invalid login details supplied.")

@login_required
def user_logout(request):
        logout(request)
        nextURL = "/clusters/"

        if ('next' in request.GET):
                nextURL = request.GET['next']

        return HttpResponseRedirect(nextURL)

