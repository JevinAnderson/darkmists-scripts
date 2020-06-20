# darkmists scripts

## Installation

Install node
globally install the node module darkmists-scripts

```
npm install -g darkmists-scripts
```

## Usage

### CLI

dmscript is the global command

### Arguments

You can use the short or long name of the command, and separate input with `` or `=`

```
-i, --input: The directory where area files are located. I search in this directory for .are files
-o, --output: The directory where generated content will be placed. If it doesn't exist, it will be created
-m, --maps: Command to generate map web pages
-p, --processes: An upper limit on the number of processes I'll run to get the job done
```

### Example

dmscript -i ./areafiles -o ~/Desktop/memorial/areas -m
dmscript --input=./areafiles -output=~/Desktop/memorial/areas --maps
