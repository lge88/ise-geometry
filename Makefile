
SRC = $(wildcard lib/*.js) $(wildcard lib/*.css) $(wildcard lib/*.html)

UNAME := $(shell uname)

ifeq ($(UNAME), Linux)
	OPEN=gnome-open
endif
ifeq ($(UNAME), Darwin)
	OPEN=open
endif

build: components $(SRC) component.json
	@(node _ise_/build && touch components)

ise-geometry.js: components
	@component build --standalone ise-geometry --name ise-geometry --out .

components: component.json
	@(component install --dev && touch components)

clean:
	rm -fr build components template.js _ise_/build/backup

component.json: $(SRC)
	@node _ise_/build/auto-update-file-list.js

test: build
	$(OPEN) test/index.html

demo: build
	$(OPEN) examples/index.html

.PHONY: clean ise-geometry.js test
