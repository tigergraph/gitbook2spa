
.PHONY: clean

exec/parser:
	go build -o $@

clean:
	rm -rf exec

build:
	./exec/parser -zip ${ZIP} -dir ${DIR} -white ${WHITE}
	# cd ${DIR}/source && yarn prod

dev:
	./exec/parser -zip ${ZIP} -dir ${DIR} -white ${WHITE}
	cd ${DIR}/source && yarn dev