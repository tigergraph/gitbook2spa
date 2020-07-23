build_dir=build_temp
parser=release/parser

.PHONY: clean exec/parser build doc docker-image

$(parser):
	go build -o $@

clean:
	rm -rf exec $(build_dir)

$(build_dir):
	mkdir $@

build: $(parser) $(build_dir)
	$(parser) -zip ${ZIP} -dir ./$(build_dir) -white ${WHITE} -default ${DEFAULT}
	cd $(build_dir)/src && yarn && yarn build

doc: $(parser) $(build_dir)
	$(parser) -zip gitbook.zip -dir ./$(build_dir) -white 2.2,2.3,2.4,2.5,2.6,3.0 -default 2.6
	cd $(build_dir)/src && yarn && yarn build

release/nginx.conf:
	cp docker/nginx.conf $@

release/doc: doc
	rm -rf $@
	cp -r $(build_dir)/dist $@

docker-image: release/doc release/nginx.conf
	docker build -f docker/Dockerfile ./release -t document

update_parser: 
	rm -rf exec $(parser)
	go build -o $(parser)