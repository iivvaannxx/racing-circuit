{
  inputs = {
    
    nixpkgs.url = "github:NixOS/nixpkgs/master";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }: let 

    inherit (flake-utils.lib) eachDefaultSystem;
    mkFlake = system: let 

      # The set of packages to be used.
      pkgs = import nixpkgs { inherit system; };
    
    in {

      devShells.default = pkgs.mkShell {

        # The packages used within the project.
        packages = with pkgs; [

          nodejs-slim
          nodePackages.pnpm
        ];
      };
    };

  in eachDefaultSystem mkFlake;
}
