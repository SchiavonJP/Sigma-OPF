#!/bin/bash

#P1: dataset file name
#P2: percentage for the training set size [0,1]
#P3: percentage for the evaluation set size [0,1]
#P4: percentage for the test set size [0,1]
#P5: normalize features? 1 - Yes  0 - No
#P6: running times

if [ "$#" -eq "6" ]; then
	clear

	for ((it = 1; it <= $6; it++))
	do
		echo "Running iteration "$it

		sleep 1

		#generating sets *****
		OPF_files/opf_split $1 $2 $3 $4 $5

		#executing supervised OPF without learning
		OPF_files/opf_train OPF_files/training.dat
		OPF_files/opf_classify OPF_files/testing.dat
		OPF_files/bin/opf_accuracy OPF_files/testing.dat

		#renaming files
		cp training.dat training.learning.dat
		cp testing.dat testing.learning.dat

		#executing supervised OPF with learning
		OPF_files/opf_learn OPF_files/training.learning.dat OPF_files/evaluating.dat
		OPF_files/opf_classify OPF_files/testing.learning.dat
		OPF_files/opf_accuracy OPF_files/testing.learning.dat

	done

	echo -e "\n\nOPF results without learning ----------------------------"
	OPF_files/statistics  OPF_files/testing.dat.acc $6 "Supervised OPF mean accuracy"
	OPF_files/statistics  OPF_files/training.dat.time $6 "Supervised OPF mean training phase execution time (s)"
	OPF_files/statistics  OPF_files/testing.dat.time $6 "Supervised OPF mean test phase execution time (s)"

	echo -e "\n\nOPF results with learning ----------------------------"
	OPF_files/statistics  OPF_files/testing.learning.dat.acc $6 "Supervised OPF mean accuracy"
	OPF_files/statistics  OPF_files/training.learning.dat.time $6 "Supervised OPF mean learning phase execution time (s)"
	OPF_files/statistics  OPF_files/testing.learning.dat.time $6 "Supervised OPF mean test phase execution time (s)"

	rm OPF_files/training.dat OPF_files/evaluating.dat OPF_files/testing.dat OPF_files/training.learning.dat OPF_files/testing.learning.dat OPF_files/classifier.opf #*.acc *.time
else
	echo "Script that executes the supervised OPF"
	echo "P1: dataset file name"
	echo "P2: percentage for the training set size [0,1]"
	echo "P3: percentage for the evaluation set size [0,1]"
	echo "P4: percentage for the test set size [0,1]"
	echo "P5: normalize features? 1 - Yes  0 - No"
	echo "P6: running times"
fi
