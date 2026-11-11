from django.shortcuts import render


def login_page(request):
    return render(request, "tutoBlog/login.html")


def hr_dashboard(request):
    return render(request, "tutoBlog/hr_dashboard.html")


def hr_tutorials(request):
    return render(request, "tutoBlog/hr_tutorials.html")


def hr_editor(request):
    return render(request, "tutoBlog/hr_editor.html")


def hr_zuweisung(request):
    return render(request, "tutoBlog/hr_zuweisung.html")


def ma_dashboard(request):
    return render(request, "tutoBlog/ma_dashboard.html")


def ma_tutorial(request):
    return render(request, "tutoBlog/ma_tutorial.html")
