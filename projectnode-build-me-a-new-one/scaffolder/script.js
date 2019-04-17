const fs = require('fs');
const mkdirp = require('mkdirp');
const download = require('download-file');

const project_folder = 'project';
const scaffold_type = process.argv[2];

const config = {
  scaffolds: JSON.parse(fs.readFileSync('scaffolder/config/scaffolds.json', 'utf8')),
  libraries: JSON.parse(fs.readFileSync('scaffolder/config/libraries.json', 'utf8')),
};

const scaffoldProject = () => {
  if (config.scaffolds.hasOwnProperty(scaffold_type)) {
    const folders = config.scaffolds[scaffold_type].folders;
    const libraries = config.scaffolds[scaffold_type].libraries;

    if (!fs.existsSync(project_folder)) {
      mkdirp(project_folder, err => {
        for (const folder in folders) {
          let folder_path = project_folder;

          if (folder !== '/') {
            folder_path += '/' + folder;
            mkdirp(folder_path);
          }

          for (const file in folders[folder]) {
            fs.writeFile(`${folder_path}/${file}.${folders[folder][file].type}`, folders[folder][file].content, () => {
            });
          }
        }

        if (libraries && libraries.length > 0) {
          const libraries_folder = project_folder + '/libraries';

          mkdirp(libraries_folder, err => {
            for (const library of libraries) {
              const library_folder = libraries_folder + '/' + library.replace(/^@/g, '');

              if (config.libraries.hasOwnProperty(library)) {
                mkdirp(library_folder, err => {

                  for (const file in config.libraries[library]) {
                    const url = config.libraries[library][file];
                    const options = {
                      directory: './' + library_folder,
                      filename: file,
                    };
                    download(url, options, err => {
                    });
                  }
                });
              }
            }
          });
        }
      });
    }
    else {
      console.log(`Folder ${project_folder} already exists!`);
    }
  }
  else {
    console.log('Wrong scaffold type!');
  }
};

module.exports = {scaffoldProject};
