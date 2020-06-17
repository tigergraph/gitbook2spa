build_dir=build_temp

.PHONY: clean exec/parser build release

exec/parser:
	go build -o $@

clean:
	rm -rf exec $(build_dir)

$(build_dir):
	mkdir $@

build: exec/parser $(build_dir)
	./exec/parser -zip ${ZIP} -dir ./$(build_dir) -white ${WHITE} -default ${DEFAULT}
	cd $(build_dir)/source && yarn && yarn prod

release: exec/parser $(build_dir)
	./exec/parser -zip gitbook.zip -dir ./$(build_dir) -white 2.2,2.3,2.4,2.5,2.6,3.0 -default 2.6
	cd $(build_dir)/source && yarn && yarn prod