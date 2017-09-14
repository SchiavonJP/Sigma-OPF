#!/bin/bash

#P1: dataset file name
#P2: percentage for the training set size [0,1]
#P3: percentage for the test set size [0,1]
#P4: normalize features? 1 - Yes  0 - No
#P5: running times
#P6: file directory

if [ "$#" -eq "6" ]; then
	clear
		
		#generating sets *****
		OPF_files/opf_split $1 $2 0 $3 $4 $6

		#executing supervised OPF
		OPF_files/opf_train OPF_files/training.dat $6
		OPF_files/opf_classify OPF_files/testing.dat $6
		OPF_files/opf_accuracy OPF_files/testing.dat $6

else
	echo "Script that executes the supervised OPF"
	echo "P1: dataset file name"
	echo "P2: percentage for the training set size [0,1]"
	echo "P3: percentage for the test set size [0,1]"
	echo "P4: normalize features? 1 - Yes  0 - No"
	echo "P5: running times"
	echo "P6: file directory"
fi
