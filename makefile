
SRCDIRS := pages components api
SRCFILES := server.js $(shell find $(SRCDIRS) -regex ^.*\.jsx?$)
CONFIG := ./.prettierrc
PRETTY := npx prettier --config $(CONFIG)

.PHONY: help
help:
	@echo give me a rule

# Verify whether all source files are correctly formatted
.PHONY: format-check
format-check:
	@$(PRETTY) --check $(SRCFILES); exit 0

# Format all files
.PHONY: format-run
format-run:
	@$(PRETTY) --write $(SRCFILES)
