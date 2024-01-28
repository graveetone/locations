from colorama import Fore, Style, Back

class ColorPrint:
    def __init__(self, color='', background=''):
        self.color = color
        self.background = background

    def __enter__(self):
        color = getattr(Fore, self.color.upper(), '')
        background = getattr(Back, self.background.upper(), '')

        print(color + background, end='')
        return print

    def __exit__(self, *args, **kwargs):
        print(Style.RESET_ALL)


if __name__ == "__main__":
    # available colors: black, magenta, yellow, blue, red, white, green, cyan
    # usage example
    with ColorPrint('magenta', 'green') as print:
        print('this will be printed magenta on the green background')

    print('this will not be magenta on the green background')
