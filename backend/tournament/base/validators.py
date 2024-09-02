from django.core import validators
from django.utils.deconstruct import deconstructible
from django.utils.translation import gettext_lazy as _

@deconstructible
class CustomUsernameValidator(validators.RegexValidator):
    regex = r"^(?=.{4,})[\w.@+-]+\Z"
    message = _(
        "Enter a valid username. This value must contain at least 4 characters, may contain only letters, "
        "numbers, and @/./+/-/_ characters"
    )
    flags = 0
    def __call__(self, value):
        print(f"Validating username: {value}")  # Debug statement
        super().__call__(value)