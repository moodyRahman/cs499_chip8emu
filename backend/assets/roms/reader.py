

with open("SpaceInvaders.ch8", mode="rb") as file:
    contents = file.read()
    for line in contents:
        print(hex(line))
